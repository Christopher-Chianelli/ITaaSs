/*
* Copyright 2019 Christopher Chianelli
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var spreadsheetLink = "REPLACE WITH LINK TO SPREADSHEET";
var subjectHeaderPrefix = "REPLACE WITH SUBJECT HEADER PREFIX";

// Get the Email list
function getEmailList(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("People Tracker");
  var startRow = 2; //A2 has first real data
  var numRows = sheet.getLastRow() - 1;//If the last row was A2, then lastRow() is 2 and we have 1 row of data 
  var dataRange = sheet.getRange(startRow, 1, numRows, 2);
  // Fetch values for each row in the Range.
  return dataRange.getValues();
}

// Send an email to all users
function notifyAllUsers(subject, message) {
  var data = getEmailList();
  for (i in data) {
    var row = data[i];
    var rowName = row[0]; // First column
    var rowEmail = row[1]; // Second column
    MailApp.sendEmail({
      to: rowEmail,
      subject: subject,
      htmlBody: message
    });
  }
}

// Send an email to a user with the given name
function sendEmailTo(name, subject, message) {
  var data = getEmailList();
  for (i in data) {
    var row = data[i];
    var rowName = row[0]; // First column
    var rowEmail = row[1]; // Second column
    if (name == rowName) {
      MailApp.sendEmail({
        to: rowEmail,
        subject: subject,
        htmlBody: message
      });
      break;
    }
  }
}

function getMessageForIssue(issue) {
  var messageHTML = HtmlService.createHtmlOutput('<h1>');
  switch(issue.status) {
    case "open":
      messageHTML.append("A new task been created:</h1>");
      break;
      
    case "closed":
      messageHTML.append("A task been closed:</h1>");
      break;
      
    case "in progress":
      messageHTML.append("A task has been moved to in progress:</h1>");
      break;
      
    case "review":
      messageHTML.append("A task is ready to be reviewed:</h1>");
      break;
      
    case "accepted":
      messageHTML.append("A task was reviewed and accepted:</h1>");
      break;
      
    case "rejected":
      messageHTML.append("A task was reviewed and rejected:</h1>");
      break;
  }
  messageHTML.append("<h2>");
  messageHTML.appendUntrusted(issue.title);
  messageHTML.append("</h2>");
  messageHTML.append("<div>");
  messageHTML.appendUntrusted(issue.description);
  messageHTML.append("</div>");
  
  if (issue.dueBy != null) {
    messageHTML.append("<h3>Due by: ");
    messageHTML.appendUntrusted(issue.dueBy);
    messageHTML.append("</h3>");
  }
  
  if (issue.assignedTo != null) {
    messageHTML.append("<h3>Assigned To: ");
    messageHTML.appendUntrusted(issue.assignedTo);
    messageHTML.append("</h3>");
  }
  
  if (issue.reviewer != null) {
    messageHTML.append("<h3>Reviewer: ");
    messageHTML.appendUntrusted(issue.reviewer);
    messageHTML.append("</h3>");
  }
  
  if (issue.attachments != null) {
    messageHTML.append("<h3>Attachments:</h3>");
    messageHTML.append("<ul>");
    for (i in issue.attachments) {
      messageHTML.append('<li><a href="');
      messageHTML.appendUntrusted(issue.attachments[i]);
      messageHTML.append('">');
      messageHTML.appendUntrusted(issue.attachments[i]);
      messageHTML.append("</a></li>");
    }
    messageHTML.append("</ul>");
  }
  
  messageHTML.append("<h3>Status: ");
  messageHTML.appendUntrusted(issue.status);
  messageHTML.append("</h3>");
  
  messageHTML.append('<a href="');
  messageHTML.appendUntrusted(spreadsheetLink);
  messageHTML.append('">Go to issue tracker </a>');
  
  return messageHTML.getContent();
}

function nullIfEmpty(value) {
  if (value == "") {
    return null;
  }
  return value;
}

function getIssue(id) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Issue Tracker");
  var startRow = 2; //A2 has first real data
  var numRows = sheet.getLastRow() - 1;//If the last row was A2, then lastRow() is 2 and we have 1 row of data 
  var dataRange = sheet.getRange(startRow, 1, numRows, 8);
  // Fetch values for each row in the Range.
  var data = dataRange.getValues();
  
  for (i in data) {
    var row = data[i];
    var rowId = row[0]; // First column
    if (rowId == id) {
      return getIssueFromRow(row);
    }
  }
  return null;
}

function getIssueFromRow(row) {
  var id = nullIfEmpty(row[0]); // First column
  var title = nullIfEmpty(row[1]);
  var description = nullIfEmpty(row[2]);
  var dueBy = nullIfEmpty(row[3]);
  var assignedTo = nullIfEmpty(row[4]);
  var reviewer = nullIfEmpty(row[5]);
  var attachments = nullIfEmpty(row[6]);
  
  if (attachments != null) {
    attachments = attachments.split(",");
  }
  
  var status = nullIfEmpty(row[7]);
  return {
    id: id,
    title: title,
    description: description,
    dueBy: dueBy,
    assignedTo: assignedTo,
    reviewer: reviewer,
    attachments: attachments,
    status: status
  };
}

function onEdit(e) {
  if (e.range.getColumn() != 8) return;
  
  var startRow = e.range.getRow();
  var numRows = e.range.getHeight();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Issue Tracker");
  var dataRange = sheet.getRange(startRow, 1, numRows, 8);
  // Fetch values for each row in the Range.
  var data = dataRange.getValues();
  
  for (i in data) {
    var row = data[i];
    var issue = getIssueFromRow(row);
    if (issue.id != null && issue.title != null && issue.description != null && issue.status != null) {
      var message = getMessageForIssue(issue);
      switch (issue.status) {
        case "open":
          var subject = subjectHeaderPrefix + "New task created: " + issue.title;
          notifyAllUsers(subject, message);
          break;
          
        case "closed":
          var subject = subjectHeaderPrefix + "Task closed: " + issue.title;
          notifyAllUsers(subject, message);
          break;
          
        case "in progress":
          break;
          
        case "review":
          var subject = subjectHeaderPrefix + "Task ready for review: " + issue.title;
          if (issue.reviewer != null) {
            sendEmailTo(issue.reviewer,subject, message);
          }
          else {
            notifyAllUsers(subject, message);
          }
          break;
          
        case "accepted":
          var subject = subjectHeaderPrefix + "Work on task was accepted: " + issue.title;
          if (issue.assignedTo != null) {
            sendEmailTo(issue.assignedTo, subject, message);
          }
          else {
            notifyAllUsers(subject, message);
          }
          break;
          
        case "rejected":
          var subject = subjectHeaderPrefix + "Work on task was rejected: " + issue.title;
          if (issue.assignedTo != null) {
            sendEmailTo(issue.assignedTo, subject, message);
          }
          else {
            notifyAllUsers(subject, message);
          }
          break;
      }
    }
  }
}
