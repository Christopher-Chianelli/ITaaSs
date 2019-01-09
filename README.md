= ITaaSs: Issue Tracker as a Spreadsheet

== What is it?

Issue Tracker as a Spreadsheet, or ITaaSs for short, converts a Google
Spreadsheet into an issue tracker, coupled with emails for new issues and when
issues are ready for review.

== Should I use it?

Probably not; in most cases, you should use an actual issue tracker instead.
However, this has the advantage that account creation is not required
(just make sure you trust the people who has access to the spreadsheet).

== Spreadsheet Format

The Spreadsheet must have these two sheets:

- "People Tracker": A spreadsheet with column A for name and column B for email
(entries start on second row)

- "Issue Tracker": A spreadsheet with column A for id, column B for
issue title, column C for issue description, column D for due by,
column E for assigned to, column F for attachments and column G for
status. (entries start on second row)

== When are emails sent?

Emails are sent whenever the status of an issue is edited.

== How to set it up?

Create a new Google Apps Script project, copy code.gs into the file,
modify the variables at the top of the script, and create an edit trigger
that calls onEdit(e).
