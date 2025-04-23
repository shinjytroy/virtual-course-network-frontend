import DOMPurify from "dompurify";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useLectureDurations from "../../../../hooks/useLectureDurations";
import { useInstructorDetailsQuery } from "../../../../redux/slices/instructor/instructorApiSlice";
import {
  addCourseToCart,
  addCourseToWishlist,
  fetchCartItems,
} from "../../../../services/studentService";
import {
  Chapter,
  Chart,
  Cloud,
  Icon1,
  Icon2,
  Import,
  Key,
  Mobile,
  People,
  Play,
  Teacher,
  Timer2,
  Users,
  Video2,
} from "../../../imagepath";
import useCurrencyFormatter from "../../../../hooks/useCurrencyFormatter";
import ReactPlayer from "react-player";
import Popup from "../../../pages/course/popup/popup";
const DetailsContent = ({ courseDetails }) => {
  const [openStates, setOpenStates] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [cartCourses, setCartCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [studentId, setStudentId] = useState(
    () => localStorage.getItem("studentId") || ""
  );
  const formatCurrency = useCurrencyFormatter();
  const storedInstructorId = localStorage.getItem("instructorId");
  const isInstructor = storedInstructorId && storedInstructorId !== "null";

  // Derived states
  const instructorIdNumber = Number(courseDetails.instructorId);
  const durations = useLectureDurations(
    courseDetails.sections.flatMap((section) => section.lectures || [])
  );

  const openPopup = (videoLink) => {
    const embedUrl = videoLink.replace(
      "https://www.youtube.com/watch?v=",
      "https://www.youtube.com/embed/"
    );
    setVideoUrl(embedUrl); // Cập nhật URL video
    setPopupOpen(true); // Mở popup
  };

  const closePopup = () => {
    setPopupOpen(false); // Đóng popup
    setVideoUrl(""); // Reset URL video
  };

  // Fetch instructor details
  const {
    data: instructorDetails,
    isLoading,
    isError,
  } = useInstructorDetailsQuery({
    id: instructorIdNumber,
  });

  // Sync studentId with localStorage every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newStudentId = localStorage.getItem("studentId");
      if (newStudentId !== studentId) {
        setStudentId(newStudentId);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [studentId]);

  // Fetch cart items when studentId changes
  useEffect(() => {
    if (!studentId) return;

    const getCartItems = async () => {
      try {
        console.log(`Fetching cart items for studentId: ${studentId}`);
        const courses = await fetchCartItems(studentId);
        setCartCourses(courses);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    getCartItems();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;

    const getWishlist = async () => {
      try {
        const wishlistData = await addCourseToWishlist(studentId);
        setWishlist(wishlistData);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    getWishlist();
  }, [studentId]);

  // Helper function to check if course is in cart
  const isCourseInCart = (courseId) => {
    return cartCourses.some((item) => item.course?.id === courseId);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!studentId) {
      toast.error("You need to login to add to cart.");
      return;
    }

    if (isCourseInCart(courseDetails.id)) {
      toast.info("This course is already in your cart!");
      return;
    }

    try {
      setCartLoading(true);
      await addCourseToCart(studentId, { id: courseDetails.id });
      toast.success("Added to cart successfully!");
      setCartCourses([...cartCourses, { course: { id: courseDetails.id } }]);
    } catch (error) {
      toast.error("Add to cart failed.");
    } finally {
      setCartLoading(false);
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = async () => {
    if (!studentId) {
      toast.error("You need to login to add to wishlist.");
      return;
    }

    try {
      setLoading(true);
      const result = await addCourseToWishlist(studentId, courseDetails.id);

      if (!result.success) {
        toast.info(result.message);
      } else {
        toast.success("Added to wishlist successfully!");
        setWishlist([...wishlist, courseDetails.id]);
      }
    } catch (error) {
      toast.error("Add to wishlist failed.");
    } finally {
      setLoading(false);
    }
  };

  const sanitizedCourseDescription = DOMPurify.sanitize(
    courseDetails.description
  );
  const sanitizedInstructorDescription = DOMPurify.sanitize(
    instructorDetails?.bio
  );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading instructor details.</p>;

  return (
    <>
      <section className="page-content course-sec">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Overview */}
              <div className="card overview-sec">
                <div className="card-body">
                  <h5 className="subs-title">Overview</h5>
                  <h6>Course Description</h6>
                  <p
                    style={{ textAlign: "justify" }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizedCourseDescription,
                    }}
                  ></p>
                  {courseDetails.sections &&
                    courseDetails.sections.length > 0 && (
                      <div>
                        <h6>What you&apos;ll learn</h6>
                        <ul>
                          {courseDetails.sections.map((section, index) => (
                            <li key={index}>{section.titleSection}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {/* <h6>Requirements</h6>
                  <ul className="mb-0">
                    <li>
                      You will need a copy of Adobe XD 2019 or above. A free
                      trial can be downloaded from Adobe.
                    </li>
                    <li>No previous design experience is needed.</li>
                    <li className="mb-0">
                      No previous Adobe XD skills are needed.
                    </li>
                  </ul> */}
                </div>
              </div>
              {/* /Overview */}
              {/* Course Content */}
              <div className="card content-sec">
                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-6">
                      <h5 className="subs-title">Course Content</h5>
                    </div>
                    <div className="col-sm-6 text-sm-end">
                      <h6>{courseDetails.sections?.length || 0} Sections</h6>
                    </div>
                  </div>
                  {courseDetails.sections &&
                  courseDetails.sections.length > 0 ? (
                    courseDetails.sections.map((section, sectionIndex) => (
                      <div key={section.id} className="course-card">
                        <h6 className="cou-title">
                          <Link
                            className="collapsed"
                            data-bs-toggle="collapse"
                            to={`#section-${sectionIndex}`}
                            aria-expanded={!!openStates[sectionIndex]}
                            onClick={() => {
                              const newStates = [...openStates];
                              newStates[sectionIndex] =
                                !newStates[sectionIndex];
                              setOpenStates(newStates);
                            }}
                            aria-controls={`section-${sectionIndex}`}
                          >
                            {`Section ${sectionIndex + 1}: ${
                              section.titleSection
                            }`}
                          </Link>
                        </h6>
                        <div
                          id={`section-${sectionIndex}`}
                          className={`card-collapse collapse ${
                            openStates[sectionIndex] ? "show" : ""
                          }`}
                        >
                          <ul>
                            {section.lectures && section.lectures.length > 0 ? (
                              section.lectures.map((lecture, lectureIndex) => (
                                <li key={lecture.id}>
                                  <p>
                                    <img src={Play} alt="" className="me-2" />
                                    {lecture.titleLecture}
                                  </p>
                                  <div>
                                    {sectionIndex === 0 &&
                                      lectureIndex === 0 && (
                                        <i
                                          onClick={() =>
                                            openPopup(courseDetails.urlVideo)
                                          }
                                        >
                                          <img
                                            src={Play}
                                            alt=""
                                            className="me-2"
                                          />
                                        </i>
                                      )}
                                    <span>
                                      {`${durations[lecture.id]} mm:ss` ||
                                        "N/A"}
                                    </span>
                                  </div>
                                </li>
                              ))
                            ) : (
                              <p>No lectures available in this section.</p>
                            )}
                          </ul>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No sections available for this course.</p>
                  )}
                </div>
              </div>
              {videoUrl && <ReactPlayer url={videoUrl} />}
              {/* /Course Content */}
              {/* Instructor */}
              <div className="card instructor-sec">
                <div className="card-body">
                  <h5 className="subs-title">About the instructor</h5>
                  <div className="instructor-wrap">
                    <div className="about-instructor">
                      <div className="abt-instructor-img">
                        <Link
                          to={`/instructor/${courseDetails.instructorId}/instructor-profile`}
                        >
                          <img
                            src={instructorDetails.photo}
                            alt="img"
                            className="img-fluid"
                          />
                        </Link>
                      </div>
                      <div className="instructor-detail">
                        <h5>
                          <Link
                            to={`/instructor/${courseDetails.instructorId}/instructor-profile`}
                          >
                            {`${instructorDetails.firstName} ${instructorDetails.lastName}`}
                          </Link>
                        </h5>
                        <p>{instructorDetails.title}</p>
                      </div>
                    </div>
                    {/* <Rating averageRating={instructorDetails.averageRating} /> */}
                  </div>
                  <div className="course-info d-flex align-items-center">
                    <div className="cou-info">
                      <img src={Play} alt="" />
                      <p>{instructorDetails.totalCourses} Courses</p>
                    </div>
                    <div className="cou-info">
                      <img src={Icon1} alt="" />
                      <p>{instructorDetails.totalSections} Lectures</p>
                    </div>
                    <div className="cou-info">
                      <img src={Icon2} alt="" />
                      <p>
                        {courseDetails.duration}{" "}
                        {courseDetails.duration === 1 ? "hr" : "hrs"}
                      </p>
                    </div>
                    <div className="cou-info">
                      <img src={People} alt="" />
                      <p>{instructorDetails.totalStudents} students enrolled</p>
                    </div>
                  </div>
                  <p>{instructorDetails.title}</p>
                  <div
                    style={{ textAlign: "justify" }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizedInstructorDescription,
                    }}
                  ></div>
                </div>
              </div>
              {/* /Instructor */}
            </div>
            <div className="col-lg-4">
              <div className="sidebar-sec">
                <div className="video-sec vid-bg">
                  <div className="card">
                    <div className="card-body">
                      <Link
                        to={courseDetails.urlVideo}
                        className="video-thumbnail"
                        data-fancybox=""
                      >
                        <div className="play-icon">
                          <i className="fa-solid fa-play" />
                        </div>
                        <img
                          className=""
                          src={courseDetails.imageCover}
                          alt=""
                        />
                      </Link>

                      <div className="video-details">
                        <div className="course-fee">
                          <h2>Price</h2>
                          <h2>{formatCurrency(courseDetails.basePrice)}</h2>
                        </div>
                        {!isInstructor && (
                          <>
                            <div className="row gx-2">
                              <div className="col-md-6 addHeart">
                                <button
                                  className="btn btn-wish w-100"
                                  onClick={handleAddToCart}
                                  disabled={cartLoading}
                                >
                                  {cartLoading
                                    ? "Adding to cart..."
                                    : "Add to cart"}
                                </button>
                              </div>
                              <div className="col-md-6 addHeart">
                                <button
                                  className="btn btn-wish w-100"
                                  onClick={handleAddToWishlist}
                                  disabled={loading}
                                >
                                  {loading ? "Adding..." : "Add to favorites"}
                                </button>
                              </div>
                              <Link
                                to={`/checkout/${courseDetails.id}`}
                                className="btn btn-enroll w-100"
                              >
                                Buy now
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Video */}
                {/* Include */}
                <div className="card include-sec">
                  <div className="card-body">
                    <div className="cat-title">
                      <h4>Includes</h4>
                    </div>
                    <ul>
                      <li>
                        <img src={Import} className="me-2" alt="" />{" "}
                        {courseDetails.duration}{" "}
                        {courseDetails.duration === 1 ? "hr" : "hrs"} on-demand
                        videos
                      </li>
                      <li>
                        <img src={Play} className="me-2" alt="" />{" "}
                        {courseDetails.totalArticles} downloadable resources
                      </li>
                      <li>
                        <img src={Key} className="me-2" alt="" /> Full lifetime
                        access
                      </li>
                      <li>
                        <img src={Mobile} className="me-2" alt="" /> Access on
                        mobile and website
                      </li>
                      <li>
                        <img src={Cloud} className="me-2" alt="" /> Assignments
                        on articles
                      </li>
                      <li>
                        <img src={Teacher} className="me-2" alt="" />{" "}
                        Certificate of Completion
                      </li>
                    </ul>
                  </div>
                </div>
                {/* /Include */}
                {/* Features */}
                <div className="card feature-sec">
                  <div className="card-body">
                    <div className="cat-title">
                      <h4>Includes</h4>
                    </div>
                    <ul>
                      <li>
                        <img src={Users} className="me-2" alt="" /> Enrolled:{" "}
                        <span>
                          {courseDetails.totalPurchasedStudents} students
                        </span>
                      </li>
                      <li>
                        <img src={Timer2} className="me-2" alt="" /> Duration:{" "}
                        <span>
                          {courseDetails.duration}{" "}
                          {courseDetails.duration === 1 ? "hr" : "hrs"}
                        </span>
                      </li>
                      <li>
                        <img src={Chapter} className="me-2" alt="" /> Chapters:{" "}
                        <span>{courseDetails.totalSections}</span>
                      </li>
                      <li>
                        <img src={Video2} className="me-2" alt="" /> Video:
                        <span> {courseDetails.totalLectures} videos</span>
                      </li>
                      <li>
                        <img src={Chart} className="me-2" alt="" /> Level:
                        <span>{courseDetails.level}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* /Features */}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Popup isOpen={isPopupOpen} title="Course Video" onClose={closePopup}>
        {videoUrl && <ReactPlayer url={videoUrl} />}
      </Popup>
    </>
  );
};

DetailsContent.propTypes = {
  courseDetails: PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string,
    urlVideo: PropTypes.string,
    imageCover: PropTypes.string,
    basePrice: PropTypes.number,
    duration: PropTypes.number,
    instructorId: PropTypes.number,
    level: PropTypes.level,
    totalPurchasedStudents: PropTypes.number,
    totalSections: PropTypes.number,
    totalLectures: PropTypes.number,
    totalArticles: PropTypes.number,
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        titleSection: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default DetailsContent;
