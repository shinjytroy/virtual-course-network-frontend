import React from "react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import PropTypes from "prop-types";
import Popup from "./popup";
import {
  addSection,
  updateSection,
  deleteSection,
  addLecture,
  updateLecture,
  deleteLecture,
  clearCurriculum,
} from "../../../redux/slices/course/courseSlice";
import "./utils/Curriculum.css";
// eslint-disable-next-line react/prop-types
const Curriculum = ({ nextTab3, prevTab2, isEditing }) => {
  const dispatch = useDispatch();
  const { sections } = useSelector((state) => state.course.curriculumInfo);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupInput, setPopupInput] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupAction, setPopupAction] = useState(() => () => {});
  const [errorMessage, setErrorMessage] = useState("");

  const handleOpenPopup = (title, action, defaultValue = "") => {
    setPopupTitle(title);
    setPopupAction(() => action);
    setPopupInput(defaultValue); // Hiển thị giá trị mặc định
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setPopupInput("");
  };

  const handleSavePopup = () => {
    if (popupInput.trim()) {
      popupAction(popupInput);
      handleClosePopup();
    } else {
      alert("Input cannot be empty.");
    }
  };

  const handleAddSection = (title) => {
    dispatch(
      addSection({
        title,
        lectures: [],
      })
    );
  };

  const handleUpdateSection = (sectionIndex, newTitle) => {
    dispatch(updateSection({ index: sectionIndex, title: newTitle }));
  };

  const handleDeleteSection = (sectionIndex) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      dispatch(deleteSection({ index: sectionIndex }));
    }
  };

  const handleAddLecture = (sectionIndex, title) => {
    const newLecture = {
      title,
      articles: [],
      lectureVideo: "",
      videoThumbnail: "",
    };
    dispatch(addLecture({ sectionIndex, lecture: newLecture }));
  };

  const handleUpdateLecture = (sectionIndex, lectureIndex, data) => {
    dispatch(
      updateLecture({ sectionIndex, lectureIndex, lecture: { ...data } })
    );
  };

  const handleDeleteLecture = (sectionIndex, lectureIndex) => {
    // Gọi action deleteLecture từ Redux
    dispatch(deleteLecture({ sectionIndex, lectureIndex }));
  };

  const handleAddArticle = async (sectionIndex, lectureIndex) => {
    const currentArticles =
      sections[sectionIndex].lectures[lectureIndex].articles;

    // Validate số lượng file PDF
    if (currentArticles.length >= 1) {
      setErrorMessage("You can only upload a maximum of 1 articles.");
      return;
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf"; // Chỉ cho phép file PDF
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Gọi API upload file
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "articles"); // Loại file (dựa vào API của bạn)

          const response = await fetch(
            "http://localhost:8080/api/files/upload",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error("Failed to upload file.");
          }

          const fileUrl = await response.text();
          const fileName = fileUrl.split("/").pop();

          const uploadedFile = {
            name: file.name,
            fileUrl: fileName,
            content: "",
          };

          // Cập nhật Lecture với Article mới
          const updatedLecture = {
            ...sections[sectionIndex].lectures[lectureIndex],
            articles: [...currentArticles, uploadedFile],
          };
          handleUpdateLecture(sectionIndex, lectureIndex, updatedLecture);
          setErrorMessage("");
        } catch (error) {
          console.error("Error uploading file:", error);
          setErrorMessage("Failed to upload file. Please try again.");
        }
      }
    };
    fileInput.click();
  };

  const handleDeleteArticle = (sectionIndex, lectureIndex, articleIndex) => {
    const updatedArticles = sections[sectionIndex].lectures[
      lectureIndex
    ].articles.filter((_, index) => index !== articleIndex);
    const updatedLecture = {
      ...sections[sectionIndex].lectures[lectureIndex],
      articles: updatedArticles,
    };
    handleUpdateLecture(sectionIndex, lectureIndex, updatedLecture);
  };

  const handleVideoUrlChange = async (sectionIndex, lectureIndex, url) => {
    const youtubeRegEx =
      /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/.exec(
        url
      );

    let videoThumbnail = "";
    let videoDuration = "";
    if (youtubeRegEx) {
      const videoId = youtubeRegEx[3];
      videoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      try {
        // Gọi API YouTube để lấy thông tin video
        console.log(process.env.YOUTUBE_DATA_API_V3);
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.REACT_APP_YOUTUBE_DATA_API_V3}&part=contentDetails`
        );
        const data = await response.json();
        // console.log("YouTube API Response:", data);

        if (data.items && data.items.length > 0) {
          const durationISO = data.items[0].contentDetails.duration;

          // Chuyển đổi ISO 8601 thành giây
          videoDuration = parseYouTubeDuration(durationISO);
          // console.log("Parsed video duration:", videoDuration);
        }
      } catch (error) {
        console.error("Error fetching video duration:", error);
      }
    }

    const updatedLecture = {
      ...sections[sectionIndex].lectures[lectureIndex],
      lectureVideo: url,
      videoThumbnail,
      videoDuration,
    };

    handleUpdateLecture(sectionIndex, lectureIndex, updatedLecture);
  };

  const parseYouTubeDuration = (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);

    return hours * 3600 + minutes * 60 + seconds; // Trả về tổng số giây
  };

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };
  
  const handleDownloadSampleCSV = () => {
    const sampleData = [
      {
        "Section ID": "", // Để trống để tạo mới
        Section: "Sample Section",
        "Lecture ID": "",
        Lecture: "Sample Lecture",
        "Video URL": "https://youtube.com/sample-video",
        "Article ID": "",
        "Article File": "sample-document.pdf",
        "Article Content": "This is sample content",
      },
    ];
  
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_curriculum.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    dispatch(clearCurriculum()); // Xóa dữ liệu cũ trước khi import

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunkSize: 100, // Xử lý 100 dòng mỗi lần
      chunk: async (result, parser) => {
        parser.pause(); // Tạm dừng đọc file

        await processCSVChunk(result.data, sections); // Truyền sections vào hàm

        parser.resume(); // Tiếp tục đọc phần tiếp theo
      },
      complete: () => {
        console.log("CSV Import Completed!");
      },
    });
};


  const processCSVChunk = async (dataChunk, currentSections) => {
    return new Promise((resolve) => {
        const structuredData = new Map(); // Dùng Map để tránh trùng lặp

        dataChunk.forEach((row) => {
            const sectionTitle = row["Section"]?.trim();
            const lectureTitle = row["Lecture"]?.trim();
            const videoUrl = row["Video URL"]?.trim();
            const articleFile = row["Article File"]?.trim();
            const articleContent = row["Article Content"]?.trim();

            if (!sectionTitle) return; // Bỏ qua nếu không có tiêu đề Section

            if (!structuredData.has(sectionTitle)) {
                structuredData.set(sectionTitle, {
                    title: sectionTitle,
                    lectures: [],
                });
            }

            const section = structuredData.get(sectionTitle);
            let lecture = section.lectures.find(l => l.title === lectureTitle);

            if (!lecture && lectureTitle) {
                lecture = {
                    title: lectureTitle,
                    lectureVideo: videoUrl || "",
                    articles: [],
                };
                section.lectures.push(lecture);
            }

            if (articleFile) {
                lecture.articles.push({
                    name: articleFile,
                    fileUrl: articleFile,
                    content: articleContent || "",
                });
            }
        });

        structuredData.forEach((section) => {
            const existingSection = currentSections.find(s => s.title === section.title);
            
            if (existingSection) {
                // Nếu Section đã tồn tại, cập nhật lectures
                section.lectures.forEach(lecture => {
                    const existingLecture = existingSection.lectures.find(l => l.title === lecture.title);
                    if (!existingLecture) {
                        existingSection.lectures.push(lecture);
                    }
                });
                dispatch(updateSection(existingSection));
            } else {
                // Nếu Section chưa có, thêm mới
                dispatch(addSection(section));
            }
        });

        resolve();
    });
};






  const handleExportCSV = () => {
    if (sections.length === 0) {
      alert("No data to export.");
      return;
    }

    const csvData = [];
    sections.forEach((section) => {
      section.lectures.forEach((lecture) => {
        lecture.articles.forEach((article) => {
          csvData.push({
            "Section ID": section.id || "",
            Section: section.title,
            "Lecture ID": lecture.id || "",
            Lecture: lecture.title,
            "Video URL": lecture.lectureVideo || "",
            "Article ID": article.id || "",
            "Article File": article.fileUrl || "",
            "Article Content": article.content || "",
          });
        });

        // Nếu lecture không có bài viết, vẫn ghi vào CSV
        if (lecture.articles.length === 0) {
          csvData.push({
            "Section ID": section.id || "",
            Section: section.title,
            "Lecture ID": lecture.id || "",
            Lecture: lecture.title,
            "Video URL": lecture.lectureVideo || "",
            "Article ID": "",
            "Article File": "",
            "Article Content": "",
          });
        }
      });
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "curriculum_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      <fieldset className="field-card" style={{ display: "block" }}>
        <div className="add-course-info">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="add-course-inner-header">
                <h4>Curriculum</h4>
              </div>
              <div className="add-course-section">
                <button
                  className="btn"
                  onClick={() =>
                    handleOpenPopup("Add Section", (title) =>
                      handleAddSection(title)
                    )
                  }
                >
                  Add Section
                </button>
              </div>
            </div>
            <div className="mx-4">
              <div className="import-section">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  style={{ display: "none" }}
                  id="csvUpload"
                />
                <label htmlFor="csvUpload" className="btn btn-primary w-100">
                  Import CSV
                </label>
              </div>
              {isEditing ? (
                <button
                  className="btn btn-success w-100 my-2"
                  onClick={handleExportCSV}
                >
                  Export CSV
                </button>
              ) : (
                <button
                  className="btn btn-warning w-100 my-2"
                  onClick={handleDownloadSampleCSV}
                >
                  Download Sample CSV
                </button>
              )}
            </div>
          </div>
          {/* Hiển thị các Section */}
          <div className="add-course-form">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="curriculum-grid">
                <div className="curriculum-head">
                  <p className="fs-2 fw-bold">
                    Section {sectionIndex + 1}: {section.title}
                  </p>
                  <div className="section-actions">
                    {/* Nút Chỉnh sửa */}
                    <button
                      className="btn btn-edit-section"
                      onClick={() =>
                        handleOpenPopup(
                          "Edit Section Title",
                          (newTitle) =>
                            handleUpdateSection(sectionIndex, newTitle),
                          section.title
                        )
                      }
                    >
                      <i className="far fa-pen-to-square" />
                    </button>
                    {/* Nút Xóa */}
                    <button
                      className="btn btn-delete-section"
                      onClick={() => handleDeleteSection(sectionIndex)}
                    >
                      <i className="far fa-trash-can" />
                    </button>
                  </div>
                  <button
                    className="btn"
                    onClick={() =>
                      handleOpenPopup("Add Lecture", (title) =>
                        handleAddLecture(sectionIndex, title)
                      )
                    }
                  >
                    Add Lecture
                  </button>
                </div>
                <div className="curriculum-info">
                  {/* Nội dung Section */}
                  <div id={`accordion-${sectionIndex}`}>
                    {section.lectures.map((lecture, lectureIndex) => (
                      <div key={lectureIndex} className="faq-grid">
                        <div className="faq-header">
                          <Link
                            className="collapsed faq-collapse"
                            data-bs-toggle="collapse"
                            to={`#collapse-${sectionIndex}-${lectureIndex}`}
                          >
                            <i className="fas fa-align-justify" /> Lecture{" "}
                            {lectureIndex + 1}: {lecture.title}
                          </Link>
                          <div className="faq-right">
                            <button
                              className="btn btn-edit"
                              onClick={() =>
                                handleOpenPopup(
                                  "Edit Lecture",
                                  (title) =>
                                    handleUpdateLecture(
                                      sectionIndex,
                                      lectureIndex,
                                      {
                                        ...lecture,
                                        title,
                                      }
                                    ),
                                  lecture.title
                                )
                              }
                            >
                              <i className="far fa-pen-to-square me-1" />
                            </button>
                            <button
                              className="btn btn-delete"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this lecture?"
                                  )
                                ) {
                                  handleDeleteLecture(
                                    sectionIndex,
                                    lectureIndex
                                  );
                                }
                              }}
                            >
                              <i className="far fa-trash-can" />
                            </button>
                          </div>
                        </div>

                        <div
                          id={`collapse-${sectionIndex}-${lectureIndex}`}
                          className="collapse"
                          data-bs-parent={`#accordion-${sectionIndex}`}
                        >
                          <div className="faq-body">
                            {/* Show Video */}
                            <div className="input-block">
                              Lecture Video URL:
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Video URL"
                                value={lecture.lectureVideo}
                                onChange={(e) =>
                                  handleVideoUrlChange(
                                    sectionIndex,
                                    lectureIndex,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            {lecture.lectureVideo && (
                              <>
                                <div className="input-block">
                                  <div className="add-image-box add-video-box">
                                    {lecture.videoThumbnail && (
                                      <img
                                        src={lecture.videoThumbnail}
                                        alt="Video Thumbnail"
                                        style={{
                                          width: "200px",
                                          height: "120px",
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                                {/* Hiển thị Duration */}
                                {lecture.videoDuration && (
                                  <p>
                                    <strong>Duration:</strong>{" "}
                                    {formatDuration(lecture.videoDuration)}{" "}
                                    (hh:mm:ss)
                                  </p>
                                )}
                                {lecture.lectureVideo && (
                                  <p>
                                    <a
                                      className="btn btn-warning"
                                      href={lecture.lectureVideo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Watch Video
                                    </a>
                                  </p>
                                )}
                              </>
                            )}

                            {/* Show Articles */}
                            {lecture.articles.length > 0 && (
                              <div className="lecture-articles">
                                <strong>Articles:</strong>
                                <ul>
                                  {lecture.articles.map(
                                    (article, articleIndex) => (
                                      <li key={articleIndex}>
                                        <a
                                          href={article.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {article.fileUrl.split("/").pop()}
                                        </a>
                                        <button
                                          className="btn btn-delete-article"
                                          onClick={() =>
                                            handleDeleteArticle(
                                              sectionIndex,
                                              lectureIndex,
                                              articleIndex
                                            )
                                          }
                                        >
                                          ✖
                                        </button>
                                        {/* Input để nhập Content */}
                                        <textarea
                                          className="form-control my-3"
                                          value={article.content}
                                          placeholder="Enter content for this article"
                                          onChange={(e) => {
                                            const updatedArticles =
                                              lecture.articles.map((a, idx) =>
                                                idx === articleIndex
                                                  ? {
                                                      ...a,
                                                      content: e.target.value,
                                                    }
                                                  : a
                                              );
                                            const updatedLecture = {
                                              ...sections[sectionIndex]
                                                .lectures[lectureIndex],
                                              articles: updatedArticles,
                                            };
                                            handleUpdateLecture(
                                              sectionIndex,
                                              lectureIndex,
                                              updatedLecture
                                            );
                                          }}
                                        />
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            <div className="add-article-btns">
                              <button
                                className="btn"
                                onClick={() =>
                                  handleAddArticle(sectionIndex, lectureIndex)
                                }
                              >
                                Add Article
                              </button>
                              {errorMessage && (
                                <p className="error-message">{errorMessage}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="widget-btn">
            <Link className="btn btn-black prev_btn" onClick={prevTab2}>
              Previous
            </Link>
            <Link className="btn btn-info-light next_btn" onClick={nextTab3}>
              Continue
            </Link>
          </div>
        </div>
      </fieldset>
      {/* Popup thêm Section */}
      <Popup
        isOpen={isPopupOpen}
        title={popupTitle}
        onClose={handleClosePopup}
        onSubmit={handleSavePopup}
      >
        <input
          type="text"
          className="form-control"
          value={popupInput}
          onChange={(e) => setPopupInput(e.target.value)}
          placeholder="Enter..."
        />
      </Popup>
    </>
  );
};

Curriculum.propTypes = {
  nextTab3: PropTypes.func.isRequired,
  prevTab2: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
};

export default Curriculum;
