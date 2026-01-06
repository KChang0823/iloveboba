function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); 

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- 0. 解析資料 (Parse Data) ---
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action; 

    // ==========================================
    // ⭐ 新功能：成就解鎖路由 (Achievement Router)
    // ==========================================
    if (action === 'UNLOCK_ACHIEVEMENT') {
      var achievementSheetName = "Achievements";
      var achievementSheet = ss.getSheetByName(achievementSheetName);

      // 防呆：如果 "Achievements" 分頁不存在，自動建立並加上標題
      if (!achievementSheet) {
        achievementSheet = ss.insertSheet(achievementSheetName);
        // Header: Added SourceDrinkID
        achievementSheet.appendRow(["Timestamp", "User", "AchievementTitle", "PhotoUrl", "SourceDrinkID"]);
      }

      // 準備寫入資料：[時間, 使用者, 成就名稱, 照片連結, 來源飲料ID]
      var newAchievement = [
        new Date(),            // 當下伺服器時間
        data.user,             // 前端傳來的 user
        data.achievementTitle, // 前端傳來的 achievementTitle
        data.photoUrl || "",   // 前端傳來的 photoUrl
        data.sourceDrinkId || "" // 外鍵：觸發此成就的飲料 ID
      ];

      achievementSheet.appendRow(newAchievement);
      
      return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Achievement Unlocked'}));
    }

    // ==========================================
    // 🧋 原本功能：手搖飲紀錄 (Beverage Logic)
    // ==========================================
    
    var sheetName = "工作表1"; 
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Sheet not found"}));
    }
    
    var rows = sheet.getDataRange().getValues();
    
    // --- 1. 刪除邏輯 (Delete with Cascade) ---
    if (action === "delete") {
      var targetTimestamp = String(data.timestamp);
      var deleted = false;
      
      // 1. Delete from Drink Records
      for (var i = rows.length - 1; i >= 1; i--) {
        var rowTimestamp = String(rows[i][0]); 
        
        if (rowTimestamp === targetTimestamp) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break; // Found and deleted
        }
      }

      if (deleted) {
        // 2. Cascade Delete from Achievements
        // Look for any achievement linked to this drink ID
        var achievementSheet = ss.getSheetByName("Achievements");
        if (achievementSheet) {
          var achRows = achievementSheet.getDataRange().getValues();
          // Iterate backwards safely
          for (var j = achRows.length - 1; j >= 1; j--) {
            // Check column E (index 4) for SourceDrinkID
            // Defensive check: ensure row has enough columns
            if (achRows[j].length > 4 && String(achRows[j][4]) === targetTimestamp) {
              achievementSheet.deleteRow(j + 1);
            }
          }
        }
        return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Deleted & Cascaded"}));
      }

      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "ID not found"}));
    }
    
    // --- 2. 更新邏輯 (Update) ---
    else if (action === "update") {
      var targetTimestamp = String(data.timestamp); 
      
      for (var i = 1; i < rows.length; i++) {
        var rowTimestamp = String(rows[i][0]); 
        
        if (rowTimestamp === targetTimestamp) {
          var newRowData = [[
            String(data.newTimestamp), 
            "'" + data.date,           
            data.who,                  
            data.shop,                 
            data.item,                 
            data.ice,                  
            data.sugar,                
            data.price                 
          ]];
          
          sheet.getRange(i + 1, 1, 1, 8).setValues(newRowData);
          // NOTE: If we wanted to update linked achievements' SourceDrinkID, we would do it here.
          // But usually updates don't change the FACT that a drink existed, just its properties.
          // If the timestamp changes (newTimestamp), we theoretically should update the FK.
          // However, for simplicity, we assume 'update' keeps the link valid enough or user doesn't care if the link breaks on full timestamp regeneration.
          // Given the current logic generates a NEW timestamp for updates, the link WILL BREAK.
          // TODO: Ideally updates shouldn't change the ID/Timestamp, or we should cascade update.
          // For now, per requirement, we focus on DELETE consistency.
          
          return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Updated"}));
        }
      }
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "ID not found for update"}));
    }
    
    // --- 3. 新增飲料邏輯 (Add Beverage) ---
    else {
      sheet.appendRow([
        String(data.timestamp), 
        "'" + data.date,        
        data.who,               
        data.shop,              
        data.item,              
        data.ice,               
        data.sugar,             
        data.price              
      ]);
      return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Added"}));
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}));
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 讀取飲料紀錄
  var sheet1 = ss.getSheetByName("工作表1");
  var records = [];
  if (sheet1) {
    var rows = sheet1.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!row[0]) continue;
      records.push({
        timestamp: String(row[0]),
        date: row[1],
        who: row[2],
        shop: row[3],
        item: row[4],
        ice: row[5],
        sugar: row[6],
        price: row[7]
      });
    }
  }

  // 2. 讀取成就回憶
  var sheetAch = ss.getSheetByName("Achievements");
  var achievements = [];
  if (sheetAch) {
    var achRows = sheetAch.getDataRange().getValues();
    // 結構: [Timestamp, User, AchievementTitle, PhotoUrl, SourceDrinkID]
    for (var j = 1; j < achRows.length; j++) {
      var r = achRows[j];
      if (!r[0]) continue;
      achievements.push({
        timestamp: r[0],
        user: r[1],
        title: r[2],
        photoUrl: r[3],
        sourceDrinkId: r[4] || null // Read FK
      });
    }
  }

  var result = {
    records: records,
    achievements: achievements
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}