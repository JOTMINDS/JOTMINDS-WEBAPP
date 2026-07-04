app.post('/make-server-fc8eb847/institutions/transfer-student', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const { studentId, newTeacherId, newTeacherName, institutionId } = await c.req.json();
    
    // Check if the current user is an admin of the institution
    // We could get institution by id and check if adminId matches
    const allInstitutions = await kv.getByPrefix('institution:');
    const institution = allInstitutions.find((i: any) => i.id === institutionId);
    
    if (!institution || institution.adminId !== user.id) {
      // Also allow if the user is the NEW teacher? No, admin only for now.
      return c.json({ error: 'Unauthorized to transfer students in this institution' }, 403);
    }
    
    // Get student profile
    const student = await kv.get(`user:${studentId}`);
    if (!student || student.role !== 'student') {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    // Update student's teacher reference
    student.teacherId = newTeacherId;
    student.teacherName = newTeacherName;
    
    await kv.set(`user:${studentId}`, student);
    
    return c.json({ success: true, student });
  } catch (error) {
    console.error('Error transferring student:', error);
    return c.json({ error: 'Failed to transfer student' }, 500);
  }
});
