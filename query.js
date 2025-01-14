import { ObjectId } from "bson";
import { connectToDatabase } from "./db.js";

// 1. Create index on FacultyName
export async function createFacultyIndex() {
  const db = await connectToDatabase();
  try {
    const result = await db
      .collection("faculty")
      .createIndex({ facultyName: 1 });
    console.log(`Index created: ${result}`);
    return result;
  } catch (err) {
    console.error("Error creating index:", err.message);
    throw err;
  }
}

// 2. Calculate sum of final marks
export async function calculateTotalFinalMarks() {
  const db = await connectToDatabase();
  try {
    const sumResult = await db
      .collection("course")
      .aggregate([
        {
          $group: {
            _id: null,
            sum: { $sum: "$finalMark" },
          },
        },
      ])
      .toArray();
    console.log("Total Final Marks:", sumResult[0]?.sum || 0);
    return sumResult[0]?.sum || 0;
  } catch (err) {
    console.error("Error calculating final marks:", err.message);
    throw err;
  }
}

// 3. Implement Student-Course relationship
export async function assignCoursesToStudents() {
  const db = await connectToDatabase();
  try {
    const courseIds = [
      new ObjectId("6783610dda20d79c21b624d5"),
      new ObjectId("6783610dda20d79c21b624d6"),
    ];

    const result = await db
      .collection("student")
      .updateMany({}, { $set: { courses: courseIds } });
    console.log(`${result.modifiedCount} student(s) updated with courses.`);
    return result.modifiedCount;
  } catch (err) {
    console.error("Error assigning courses:", err.message);
    throw err;
  }
}

// Get student courses
export async function getStudentCourses(firstName, lastName) {
  const db = await connectToDatabase();
  try {
    const pipeline = [
      { $match: { firstName, lastName } },
      {
        $lookup: {
          from: "course",
          localField: "courses",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
    ];

    const result = await db.collection("student").aggregate(pipeline).toArray();

    if (result.length === 0) {
      console.log("Student not found.");
      return null;
    }

    console.log("Student courses:", result[0].courseDetails);
    return result[0].courseDetails;
  } catch (err) {
    console.error("Error fetching student courses:", err.message);
    throw err;
  }
}

// 4. Implement Student-Faculty relationship
export async function assignFacultyToStudent(studentFirstName, facultyId) {
  const db = await connectToDatabase();
  try {
    const result = await db
      .collection("student")
      .updateOne(
        { firstName: studentFirstName },
        { $set: { facultyId: new ObjectId(facultyId) } }
      );
    console.log(`${result.modifiedCount} student updated with faculty.`);
    return result.modifiedCount;
  } catch (err) {
    console.error("Error assigning faculty:", err.message);
    throw err;
  }
}

// Get student with faculty details
export async function getStudentWithFaculty(firstName) {
  const db = await connectToDatabase();
  try {
    const result = await db
      .collection("student")
      .aggregate([
        { $match: { firstName } },
        {
          $lookup: {
            from: "faculty",
            localField: "facultyId",
            foreignField: "_id",
            as: "faculty",
          },
        },
      ])
      .toArray();

    console.log("Student with faculty:", result[0]);
    return result[0];
  } catch (err) {
    console.error("Error fetching student with faculty:", err.message);
    throw err;
  }
}

// 5. Calculate student average grades
export async function calculateStudentAverages() {
  const db = await connectToDatabase();
  try {
    const avgGrades = await db
      .collection("student")
      .aggregate([
        { $unwind: "$grades" },
        {
          $group: {
            _id: "$firstName",
            avg: { $avg: "$grades.grade" },
          },
        },
      ])
      .toArray();

    console.log("Student average grades:", avgGrades);
    return avgGrades;
  } catch (err) {
    console.error("Error calculating averages:", err.message);
    throw err;
  }
}

// Bonus: Display student with faculty (projected fields)
export async function getStudentFacultyProjection(firstName) {
  const db = await connectToDatabase();
  try {
    const result = await db
      .collection("student")
      .aggregate([
        { $match: { firstName } },
        {
          $lookup: {
            from: "faculty",
            localField: "facultyId",
            foreignField: "_id",
            as: "faculty",
          },
        },
        { $unwind: "$faculty" },
        {
          $project: {
            studentName: "$firstName",
            facultyName: "$faculty.facultyName",
          },
        },
      ])
      .toArray();

    console.log("Projected result:", result[0]);
    return result[0];
  } catch (err) {
    console.error("Error fetching projected data:", err.message);
    throw err;
  }
}
