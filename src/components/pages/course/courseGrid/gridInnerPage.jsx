import PropTypes from "prop-types";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useCurrencyFormatter from "../../../../hooks/useCurrencyFormatter";
import { Icon1, Icon2, Messages } from "../../../imagepath";

const GridInnerPage = ({ courses }) => {
  const formatCurrency = useCurrencyFormatter();
  const navigate = useNavigate();
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

  return (
    <>
      <div className="row">
      {courses.map((course) => (
        <div key={course.id} className="col-lg-4 col-md-6 d-flex">
          <div className="course-box course-design d-flex ">
            <div className="product">
              <div className="product-img">
                <Link to={`/course-details/${course.id}`}>
                  <img
                    className="img-fluid"
                    style={{ objectFit: 'contain', height: '200px' }}
                    alt={course.titleCourse}
                    src={course.imageCover || "/default-image.png"}
                  />
                </Link>
                <div className="price">
                  <h3>
                  <small>{course.basePrice === 0 ? "Free" : formatCurrency(course.basePrice)}</small>
                  </h3>
                </div>
                </div>
                <div className="product-content">
                  <div className="course-group d-flex">
                    <div className="course-group-img d-flex">
                      <Link to={`/instructor/${course.instructorId}/instructor-profile`}>
                        <img
                          src={course.instructorPhoto}
                          alt={course.instructorName}
                          className="img-fluid"
                        />
                      </Link>
                      <div className="course-name">
                        <h4>
                          <Link to={`/instructor/${course.instructorId}/instructor-profile`}>
                            {course.instructorFirstName} {course.instructorLastName}
                          </Link>
                        </h4>
                        <p>Instructor</p>
                      </div>
                    </div>
                    <div className="all-btn all-category d-flex align-items-center ms-2">
                      <div className="nav-item ms-2"
                        onClick={() => handleChatClick(course.instructorId)}>
                        <Link to="/student/student-messages">
                          <img src={Messages} alt="Messages" style={{ width: "40px", height: "40px" }} />
                        </Link>
                      </div>
                    </div>
                </div>

                  <h3 className="course-title">
                    <Link to={`/course-details/${course.id}`}>{course.titleCourse}</Link>
                  </h3>

                  <div className="course-info d-flex align-items-center">
                    <div className="rating-img d-flex align-items-center">
                      <img src={Icon1} alt="" />
                      <p>{course.totalLectures}+ Lessons</p>
                    </div>
                    <div className="course-view d-flex align-items-center">
                      <img src={Icon2} alt="" />
                      <p>{course.duration} {course.duration === 1 ? "hr" : "hrs"}</p>
                    </div>
                  </div>
                  <div className="all-btn all-category d-flex align-items-center">
                  {!isInstructor && (
                      <Link to={`/checkout/${course.id}`} className="btn btn-primary">
                        BUY NOW
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

GridInnerPage.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      titleCourse: PropTypes.string.isRequired,
      description: PropTypes.string,
      categoryId: PropTypes.number,
      categoryName: PropTypes.string,
      level: PropTypes.string,
      imageCover: PropTypes.string,
      basePrice: PropTypes.number,
      status: PropTypes.string,
      instructorId: PropTypes.number,
      instructorName: PropTypes.string,
      instructorPhoto: PropTypes.string,
    })
  ).isRequired,
};

export default GridInnerPage;
