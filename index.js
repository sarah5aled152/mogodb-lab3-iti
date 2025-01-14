import { connectToDatabase, closeConnection } from "./db.js";

import {
  createFacultyIndex,
  calculateTotalFinalMarks,
  assignCoursesToStudents,
  getStudentCourses,
  assignFacultyToStudent,
  getStudentWithFaculty,
  calculateStudentAverages,
  getStudentFacultyProjection,
} from "./query.js";

async function main() {
  try {
    await connectToDatabase();

    await createFacultyIndex();
    await calculateTotalFinalMarks();
    await assignCoursesToStudents();
    await getStudentCourses("Sara", "Ahmed");
    await assignFacultyToStudent("Sara", "678360dbda20d79c21b624d4");
    await getStudentWithFaculty("Sara");
    await calculateStudentAverages();
    await getStudentFacultyProjection("Sara");
  } catch (err) {
    console.error("Error in main execution:", err);
  } finally {
    await closeConnection();
  }
}

main();
