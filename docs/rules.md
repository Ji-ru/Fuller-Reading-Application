rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isFaculty() { return isAuth() && userRole() == 'faculty'; }
    function isStudent() { return isAuth() && userRole() == 'student'; }
    function isAdmin()   { return isAuth() && userRole() == 'admin'; }
    function isOwner(studentId) { return isAuth() && request.auth.uid == studentId; }

    match /miscueReports/{reportId} {
      allow create: if isStudent() && request.resource.data.studentId == request.auth.uid;
      allow read:   if isOwner(resource.data.studentId) || isFaculty() || isAdmin();
      allow write:  if isAdmin();
    }

    match /wordCompleted/{wordId} {
      allow create: if isStudent() && request.resource.data.studentId == request.auth.uid;
      allow read:   if isOwner(resource.data.studentId) || isFaculty() || isAdmin();
      allow write:  if isAdmin();
    }

    match /alphabetSessions/{sessionId} {
      allow get:    if isStudent() && (resource == null || resource.data.studentId == request.auth.uid);
      allow list:   if (isStudent() && resource.data.studentId == request.auth.uid) || isFaculty() || isAdmin();
      allow create: if isStudent() && request.resource.data.studentId == request.auth.uid;
      allow update: if isOwner(resource.data.studentId) || isFaculty() || isAdmin();
      allow delete: if isAdmin();
    }

    match /wordSessions/{sessionId} {
      allow get:    if isStudent() && (resource == null || resource.data.studentId == request.auth.uid);
      allow list:   if (isStudent() && resource.data.studentId == request.auth.uid) || isFaculty() || isAdmin();
      allow create: if isStudent() && request.resource.data.studentId == request.auth.uid;
      allow update: if isOwner(resource.data.studentId) || isFaculty() || isAdmin();
      allow delete: if isAdmin();
    }

    match /alphabetSessions/{sessionId} {
      allow get:    if isStudent() && (resource == null || resource.data.studentId == request.auth.uid);
      allow list:   if isFaculty() || isAdmin();
      allow create: if isStudent() && request.resource.data.studentId == request.auth.uid;
      allow update: if isOwner(resource.data.studentId) || isFaculty() || isAdmin();
      allow delete: if isAdmin();
    }

    match /users/{userId} {
      allow read:  if isAuth();
      allow write: if isOwner(userId) || isAdmin();
    }

    match /classes/{classId} {
      allow read:   if isAuth();
      allow create: if isFaculty() || isAdmin();
      allow update: if isFaculty() || isAdmin() || (
        isStudent() &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['pendingStudentIds', 'updatedAt']) &&
        (
          (request.resource.data.pendingStudentIds.toSet()
             .difference(resource.data.get('pendingStudentIds', []).toSet())
             .hasOnly([request.auth.uid]) &&
           resource.data.get('pendingStudentIds', []).toSet()
             .difference(request.resource.data.pendingStudentIds.toSet())
             .size() == 0)
          ||
          (resource.data.get('pendingStudentIds', []).toSet()
             .difference(request.resource.data.pendingStudentIds.toSet())
             .hasOnly([request.auth.uid]) &&
           request.resource.data.pendingStudentIds.toSet()
             .difference(resource.data.get('pendingStudentIds', []).toSet())
             .size() == 0)
        )
      );
      allow delete: if isAdmin() || (isFaculty() && resource.data.facultyId == request.auth.uid);
    }
  }
}
