export async function transferStudent(studentId: string, institutionId: string, newTeacherId: string, newTeacherName: string): Promise<boolean> {
  try {
    const res = await makeRequest('/institutions/transfer-student', {
      method: 'POST',
      body: JSON.stringify({ studentId, institutionId, newTeacherId, newTeacherName }),
    });
    return res.success === true;
  } catch (error) {
    console.error('Failed to transfer student:', error);
    return false;
  }
}
