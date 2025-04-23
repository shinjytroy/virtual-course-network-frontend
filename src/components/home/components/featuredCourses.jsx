import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon1, Icon2, Messages } from "../../../components/imagepath";
import useCurrencyFormatter from "../../../hooks/useCurrencyFormatter";
import { useGetAllCoursesByStatusQuery } from "../../../redux/slices/course/courseApiSlice";
const FeaturedCourses = () => {
  const navigate = useNavigate();
  const {
    data: courses,
    error,
    isLoading,
  } = useGetAllCoursesByStatusQuery({ status: "PUBLISHED" });
  const formatCurrency = useCurrencyFormatter();
  const storedInstructorId = localStorage.getItem("instructorId");
  const isInstructor = storedInstructorId && storedInstructorId !== "null";

  const handleChatClick = (instructorId) => {
    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
      navigate("/login");
    } else {
      navigate(`/student/student-messages?instructorId=${instructorId}`);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Nếu có lỗi khi gọi API
  if (error) {
    return <p>Error loading courses</p>;
  }

  return (
    // What's new Featured Course
    <section className="section new-course">
      <div className="container">
        <div className="section-header aos" data-aos="fade-up">
          <div className="section-sub-head">
            <span>What’s New</span>
            <h2>Featured Courses</h2>
          </div>
          <div className="all-btn all-category d-flex align-items-center">
            <Link to="/course-grid" className="btn btn-primary">
              All Courses
            </Link>
          </div>
        </div>
        <div className="section-text aos" data-aos="fade-up">
          <p className="mb-0">
            The Featured Courses section of the Virtual Course Network showcases
            a curated selection of the best and most popular courses available
            on the platform. These courses cover a wide range of topics and are
            designed to help learners acquire new skills and advance their
            knowledge.
          </p>
        </div>
        <div className="course-feature">
          <div className="row">
            {courses?.map((course) => (
              <div className="col-lg-4 col-md-6 d-flex" key={course.id}>
                <div className="course-box d-flex aos" data-aos="fade-up">
                  <div className="product">
                    <div className="product-img">
                      <Link to={`/course-details/${course.id}`}>
                        <img
                          className="img-fluid"
                          style={{ objectFit: "contain", height: "300px" }}
                          alt={course.titleCourse}
                          src={course.imageCover || "default-image.jpg"}
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
                            to={`/instructor/${course.instructorId}/instructor-profile`}
                          >
                            <img
                              src={
                                course.instructorPhoto || "default-avatar.jpg"
                              }
                              alt=""
                              className="img-fluid"
                            />
                          </Link>
                          <div className="course-name">
                            <h4>
                              <Link
                                to={`/instructor/${course.instructorId}/instructor-profile`}
                              >
                                {course.instructorFirstName}{" "}
                                {course.instructorLastName}
                              </Link>
                            </h4>
                            <p>Instructor</p>
                          </div>

                          <div
                            className="nav-item ms-2"
                            onClick={() => handleChatClick(course.instructorId)}
                          >
                            <Link to="/student/student-messages">
                              <img
                                src={Messages}
                                alt="Messages"
                                style={{ width: "40px", height: "40px" }}
                              />
                            </Link>
                          </div>
                        </div>
                        {/* <div className="course-share d-flex align-items-center justify-content-center">
                          <Link to="#">
                            <i
                              onClick={toggleClass}
                              className="fa-regular fa-heart"
                            />
                          </Link>
                        </div> */}
                      </div>
                      <h3 className="course-title instructor-text">
                        <Link to={`/course/${course.id}/course-details`}>
                          {course.titleCourse}
                        </Link>
                      </h3>
                      <div className="course-info d-flex align-items-center">
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
                      <div className="d-flex align-items-center justify-content-between">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
