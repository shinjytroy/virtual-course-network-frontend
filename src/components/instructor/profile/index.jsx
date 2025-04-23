import DOMPurify from "dompurify";
import React from "react";
import { Link, useParams } from "react-router-dom";
import useCurrencyFormatter from "../../../hooks/useCurrencyFormatter";
import { useGetInstructorCoursesQuery } from "../../../redux/slices/course/courseApiSlice";
import { useInstructorDetailsQuery } from "../../../redux/slices/instructor/instructorApiSlice";
import Footer from "../../footer";
import RoleBasedHeader from "../../header/RoleBasedHeader";
import { CoursesIcon, Icon1, Icon2, TtlStudIcon } from "../../imagepath";
import { useSelector } from "react-redux";
import { selectCurrentRoles } from "../../../redux/slices/auth/authSlice";

export default function InstructorProfile() {
  const roles = useSelector(selectCurrentRoles);
  const storedInstructorId = localStorage.getItem("instructorId");
  const isInstructor = storedInstructorId && storedInstructorId !== "null";
  const formatCurrency = useCurrencyFormatter();
  const { instructorId } = useParams();
  const {
    data: instructor,
    isLoading,
    isError,
  } = useInstructorDetailsQuery({ id: instructorId });

  const { data: courses } = useGetInstructorCoursesQuery({
    instructorId: instructorId,
    status: "PUBLISHED",
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading instructor details.</p>;

  const sanitizedInstructorBio = DOMPurify.sanitize(instructor.bio);
  return (
    <div className="main-wrapper">
      <RoleBasedHeader activeMenu={"Profile"} />
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-12">
              <div className="breadcrumb-list">
                <nav aria-label="breadcrumb" className="page-breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/home">Home</Link>
                    </li>
                    <li className="breadcrumb-item" aria-current="page">
                      Instructor
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Instructor Profile
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb */}
      {/* Breadcrumb */}
      <div className="page-banner instructor-bg-blk">
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-12">
              <div className="profile-info-blk">
                <Link to="#" className="profile-info-img">
                  <img
                    src={instructor.photo || "https://via.placeholder.com/150"}
                    alt=""
                    className="img-fluid"
                  />
                </Link>
                <h4>
                  <Link to="#">
                    {`${instructor.firstName} ${instructor.lastName}` ||
                      "Instructor Name"}
                  </Link>
                  <span>{instructor.title}</span>
                </h4>
                <p>Instructor</p>
                <ul className="list-unstyled inline-inline profile-info-social">
                  {/* Facebook */}
                  {instructor.social.facebookUrl && (
                    <li className="list-inline-item">
                      <Link to={instructor.social.facebookUrl} target="_blank">
                        <i className="fa-brands fa-facebook"></i>
                      </Link>
                    </li>
                  )}

                  {/* Google */}
                  {instructor.social.googleUrl && (
                    <li className="list-inline-item">
                      <Link to={instructor.social.googleUrl} target="_blank">
                        <i className="fa-brands fa-google"></i>
                      </Link>
                    </li>
                  )}

                  {/* Instagram */}
                  {instructor.social.instagramUrl && (
                    <li className="list-inline-item">
                      <Link to={instructor.social.instagramUrl} target="_blank">
                        <i className="fa-brands fa-instagram"></i>
                      </Link>
                    </li>
                  )}

                  {/* LinkedIn */}
                  {instructor.social.linkedinUrl && (
                    <li className="list-inline-item">
                      <Link to={instructor.social.linkedinUrl} target="_blank">
                        <i className="fa-brands fa-linkedin"></i>
                      </Link>
                    </li>
                  )}
                  {roles && roles.includes("ROLE_INSTRUCTOR") ? null : (
                    <li className="list-inline-item">
                      <div className="all-btn all-category d-flex align-items-center">
                        <Link
                          to={`/student/student-messages?instructorId=${instructorId}`}
                          className="btn btn-primary bg-success"
                        >
                          CHAT NOW
                        </Link>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb */}
      {/* Course Content */}
      <section className="page-content course-sec">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Overview */}
              <div className="card overview-sec">
                <div className="card-body">
                  <h5 className="subs-title">About Me</h5>
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizedInstructorBio }}
                  ></div>
                </div>
              </div>
              {/* Overview */}

              {/* Education Content */}
              <div className="card education-sec">
                <div className="card-body">
                  <h5 className="subs-title">Education</h5>
                  {instructor.education && instructor.education.length > 0 ? (
                    instructor.education.map((edu, index) => (
                      <div className="edu-wrap" key={index}>
                        <div className="edu-name">
                          <span>{edu.degree[0]}</span>
                        </div>
                        <div className="edu-detail">
                          <h6>{edu.degree}</h6>
                          <p className="edu-duration">
                            {edu.university}{" "}
                            {(edu.startYear || edu.endYear) && (
                              <>
                                ({edu.startYear || "Past"} →{" "}
                                {edu.endYear || "Present"})
                              </>
                            )}
                          </p>
                          <p>{edu.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No education information available.</p>
                  )}
                </div>
              </div>
              {/* Education Content */}

              {/* Experience Content */}
              <div className="card education-sec">
                <div className="card-body">
                  <h5 className="subs-title">Experience</h5>
                  {instructor.experiences &&
                  instructor.experiences.length > 0 ? (
                    instructor.experiences.map((exp, index) => (
                      <div className="edu-wrap" key={index}>
                        <div className="edu-name">
                          <span>{exp.position[0]}</span>
                        </div>
                        <div className="edu-detail">
                          <h6>{exp.position}</h6>
                          <p className="edu-duration">
                            {exp.company} ({exp.startYear || "Past"} -&gt;{" "}
                            {exp.endYear || "Present"})
                          </p>
                          <p>{exp.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No experience information available.</p>
                  )}
                </div>
              </div>
              {/* Experience Content */}

              {/* Courses Content */}
              <div className="card education-sec">
                <div className="card-body pb-0">
                  <h5 className="subs-title">Courses</h5>
                  <div className="row">
                    {courses && courses.length > 0 ? (
                      courses.map((course, index) => (
                        <div className="col-lg-6 col-md-6 d-flex" key={index}>
                          <div className="course-box course-design d-flex">
                            <div className="product">
                              <div className="product-img">
                                <Link
                                  to={`/course/${course.id}/course-details`}
                                >
                                  <img
                                    className="img-fluid"
                                    style={{
                                      objectFit: "contain",
                                      height: "200px",
                                    }}
                                    alt={course.titleCourse}
                                    src={course.imageCover}
                                  />
                                </Link>
                                <div className="price">
                                  <h3>{formatCurrency(course.basePrice)}</h3>
                                </div>
                              </div>
                              <div className="product-content">
                                <div className="course-group d-flex">
                                  <div className="course-group-img d-flex">
                                    <Link
                                      to={`/course/${course.id}/course-details`}
                                    >
                                      <img
                                        src={
                                          course.instructorPhoto ||
                                          "https://via.placeholder.com/150"
                                        }
                                        alt=""
                                        className="img-fluid"
                                      />
                                    </Link>
                                    <div className="course-name">
                                      <h4>
                                        <Link
                                          to={`/course/${course.id}/course-details`}
                                        >
                                          {course.instructorFirstName}{" "}
                                          {course.instructorLastName}
                                        </Link>
                                      </h4>
                                      <p>Instructor</p>
                                    </div>
                                  </div>
                                </div>
                                <h3 className="course-title instructor-text">
                                  <Link
                                    to={`/course/${course.id}/course-details`}
                                  >
                                    {course.titleCourse}
                                  </Link>
                                </h3>
                                <div className="course-info d-flex align-items-center border-0 m-0">
                                  <div className="rating-img d-flex align-items-center">
                                    <img src={Icon1} alt="" />
                                    <p>{course.totalLectures}+ Lessons</p>
                                  </div>
                                  <div className="course-view d-flex align-items-center">
                                    <img src={Icon2} alt="" />
                                    <p>
                                      {course.duration}{" "}
                                      {course.duration === 1 ? "hr" : "hrs"}
                                    </p>
                                  </div>
                                </div>
                                <div className="all-btn all-category d-flex align-items-center">
                                  {!isInstructor && (
                                    <Link
                                      to={`/checkout/${course.id}`}
                                      className="btn btn-primary"
                                    >
                                      BUY NOW
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No courses available</p>
                    )}
                  </div>
                </div>
              </div>
              {/*Courses Content  */}
            </div>

            <div className="col-lg-4">
              {/* Right Sidebar Tags Label */}
              <div className="card overview-sec">
                <div className="card-body overview-sec-body">
                  <h5 className="subs-title">Professional Skills</h5>
                  <div className="sidebar-tag-labels">
                    <ul className="list-unstyled">
                      {instructor.skills && instructor.skills.length > 0 ? (
                        instructor.skills.map((skill) => (
                          <li key={skill.id}>
                            <Link to="#">{skill.skillName}</Link>
                          </li>
                        ))
                      ) : (
                        <li>No skills available</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              {/* Right Sidebar Tags Label */}

              {/* Right Sidebar Profile Overview */}
              <div className="card overview-sec">
                <div className="card-body">
                  <h5 className="subs-title">Profile Overview</h5>

                  {/* Thống kê hồ sơ */}
                  <div className="profile-overview-list">
                    <div className="list-grp-blk d-flex">
                      <div className="flex-shrink-0">
                        <img src={CoursesIcon} alt="Courses" />
                      </div>
                      <div className="list-content-blk flex-grow-1 ms-3">
                        <h5>{instructor.totalCourses}</h5>
                        <p>Courses</p>
                      </div>
                    </div>

                    <div className="list-grp-blk d-flex">
                      <div className="flex-shrink-0">
                        <img src={TtlStudIcon} alt="Total Students" />
                      </div>
                      <div className="list-content-blk flex-grow-1 ms-3">
                        <h5>{instructor.totalStudents}</h5>
                        <p>Total Students</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Sidebar Profile Overview */}
            </div>
          </div>
        </div>
      </section>
      {/* Course Content */}
      <Footer />
    </div>
  );
}
