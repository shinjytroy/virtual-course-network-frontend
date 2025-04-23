import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import Popup from "./popup";
import {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addAnswerOption,
  updateAnswerOption,
  deleteAnswerOption,
  clearQuestionInfo,
  setQuestionInfo,
} from "../../../redux/slices/course/courseSlice";
import "./utils/Curriculum.css";

const TestQuestion = ({ nextTab4, prevTab3, isEditing }) => {
  const dispatch = useDispatch();
  const { questions } = useSelector(
    (state) => state.course.questionInfo || { questions: [] }
  );

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupInput, setPopupInput] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupAction, setPopupAction] = useState(() => () => {});

  const handleOpenPopup = (title, action, defaultValue = "") => {
    setPopupTitle(title);
    setPopupAction(() => action);
    setPopupInput(defaultValue);
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

  const generateUniqueId = () => {
    return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const questionMarks = [
    { mark: 10, content: "10-Point Questions" },
    { mark: 8, content: "8-Point Questions" },
    { mark: 6, content: "6-Point Questions" },
  ];

  const handleAddQuestion = (mark, title) => {
    dispatch(
      addQuestion({
        id: generateUniqueId(),
        title,
        mark,
        answerOptions: [],
      })
    );
  };

  const handleUpdateQuestion = (questionId, newTitle) => {
    dispatch(updateQuestion({ id: questionId, title: newTitle }));
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      dispatch(deleteQuestion({ id: questionId }));
    }
  };

  const handleAddAnswerOption = (questionId, title) => {
    const question = questions.find((q) => q.id === questionId);
    const currentAnswerOptions = question?.answerOptions || [];
    const newAnswerOption = {
      id: generateUniqueId(),
      title: title || "Untitled Option",
      isCorrect: currentAnswerOptions.length === 0,
    };
    dispatch(addAnswerOption({ questionId, answerOption: newAnswerOption }));
  };

  const handleUpdateAnswerOption = (questionId, answerId, updatedAnswer) => {
    dispatch(
      updateAnswerOption({
        questionId,
        answerId,
        answerOption: updatedAnswer,
      })
    );
  };

  const handleDeleteAnswerOption = (questionId, answerId) => {
    dispatch(
      deleteAnswerOption({
        questionId,
        answerId,
      })
    );
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected.");
      return;
    }
  
    dispatch(clearQuestionInfo());
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          alert("CSV file is empty or incorrect format.");
          return;
        }
        processCSVChunk(result.data);
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      },
    });
  };
  
  const processCSVChunk = (dataChunk) => {
    return new Promise((resolve) => {
      const structuredData = [];
  
      dataChunk.forEach((row) => {
        const {
          "Question Title": questionTitle,
          "Mark": mark,
          "Answer Option 1": answerOption1,
          "Answer Option 2": answerOption2,
          "Answer Option 3": answerOption3,
          "Answer Option 4": answerOption4,
          "Answer Option 5": answerOption5,
        } = row;
  
        if (!questionTitle || !mark) return;
  
        const answerOptions = [
          answerOption1,
          answerOption2,
          answerOption3,
          answerOption4,
          answerOption5,
        ]
          .filter(Boolean)
          .map((option) => ({
            title: option.replace(" (correct)", ""), // Loại bỏ "(correct)" khỏi tiêu đề
            isCorrect: option.toLowerCase().includes("correct"),
          }));
  
        structuredData.push({
          title: questionTitle,
          mark: parseInt(mark, 10) || 0,
          answerOptions,
        });
      });
  
      if (structuredData.length === 0) {
        alert("No valid questions found in CSV.");
        return;
      }
  
      dispatch(setQuestionInfo({ questions: structuredData })); 
      alert("CSV Import Completed!");
      resolve();
    });
  };


  const handleDownloadSampleCSV = () => {
    const sampleData = [
      {
        "Question Title": "What is Java?",
        "Mark": "10",
        "Answer Option 1": "A programming language (correct)",
        "Answer Option 2": "A fruit",
        "Answer Option 3": "A coffee",
        "Answer Option 4": "",
        "Answer Option 5": "",
      },
      {
        "Question Title": "Which of these are programming languages?",
        "Mark": "8",
        "Answer Option 1": "Java (correct)",
        "Answer Option 2": "Python (correct)",
        "Answer Option 3": "HTML",
        "Answer Option 4": "CSS",
        "Answer Option 5": "",
      },
    ];
  
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_questions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportCSV = () => {
    if (questions.length === 0) {
      alert("No questions available to export.");
      return;
    }
  
    const csvData = [
      ["Question Title", "Mark", "Answer Option 1", "Answer Option 2", "Answer Option 3", "Answer Option 4", "Answer Option 5", "Correct Answer"],
      ...questions.map((q) => {
        const answers = q.answerOptions.map(opt => opt.title);
        const correctAnswer = q.answerOptions.find(opt => opt.isCorrect)?.title || ""; // Chỉ lấy 1 đáp án đúng vào cột Correct Answer
  
        return [
          q.title,
          q.mark,
          answers[0] || "",
          answers[1] || "",
          answers[2] || "",
          answers[3] || "",
          answers[4] || "",
          correctAnswer, // Chỉ ghi đáp án đúng vào cột cuối cùng
        ];
      }),
    ];
  
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  

  return (
    <>
      <fieldset className="field-card" style={{ display: "block" }}>
        <div className="add-course-info">
          <div className="d-flex justify-content-between align-items-center">
            <div className="add-course-inner-header">
              <h4>Test Questions</h4>
            </div>

            <div className="import-section mx-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: "none" }}
                id="csvUpload"
              />
              <label htmlFor="csvUpload" className="btn btn-primary">
                Import CSV
              </label>
              {isEditing ? (
                <button
                  className="btn btn-success mx-2 mb-2"
                  onClick={handleExportCSV}
                >
                  Export CSV
                </button>
              ) : (
                <button
                  className="btn btn-warning mx-2 mb-2"
                  onClick={handleDownloadSampleCSV}
                >
                  Download Sample CSV
                </button>
              )}
            </div>
          </div>
          <div className="add-course-form">
            {questionMarks.map((questionMark) => (
              <div key={questionMark.mark} className="quiz-grid">
                <div className="quiz-head">
                  <h5>{questionMark.content}</h5>
                  <button
                    className="btn"
                    onClick={() =>
                      handleOpenPopup(
                        `Add Question for ${questionMark.content}`,
                        (title) => handleAddQuestion(questionMark.mark, title)
                      )
                    }
                  >
                    Add Question
                  </button>
                </div>
                <div className="quiz-content">
                  {questions
                    .filter((question) => question.mark === questionMark.mark)
                    .map((question) => (
                      <div key={question.id} className="quiz-item">
                        <div className="faq-grid">
                          <div className="faq-header">
                            <Link
                              className="collapsed faq-collapse"
                              data-bs-toggle="collapse"
                              to={`#collapse-quiz-${questionMark.mark}-${question.id}`}
                            >
                              <i className="fas fa-align-justify" /> Question:{" "}
                              {question.title}
                            </Link>
                            <div className="faq-right">
                              <button
                                className="btn btn-edit-quiz"
                                onClick={() =>
                                  handleOpenPopup(
                                    "Edit Question Title",
                                    (newTitle) =>
                                      handleUpdateQuestion(
                                        question.id,
                                        newTitle
                                      ),
                                    question.title
                                  )
                                }
                              >
                                <i className="far fa-pen-to-square" />
                              </button>
                              <button
                                className="btn btn-delete-quiz"
                                onClick={() =>
                                  handleDeleteQuestion(question.id)
                                }
                              >
                                <i className="far fa-trash-can" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div
                          id={`collapse-quiz-${questionMark.mark}-${question.id}`}
                          className="collapse"
                        >
                          <div className="quiz-answers">
                            {question.answerOptions.map((answer) => (
                              <div key={answer.id} className="quiz-answer">
                                <div className="answer-row d-flex align-items-center">
                                  <input
                                    type="checkbox"
                                    checked={answer.isCorrect || false}
                                    onChange={(e) =>
                                      handleUpdateAnswerOption(
                                        question.id,
                                        answer.id,
                                        {
                                          ...answer,
                                          isCorrect: e.target.checked,
                                        }
                                      )
                                    }
                                  />
                                  <p className="m-0 flex-grow-1">
                                    Answer:
                                    <strong>{answer.title}</strong>
                                  </p>
                                  <button
                                    className="btn btn-delete-article"
                                    onClick={() =>
                                      handleDeleteAnswerOption(
                                        question.id,
                                        answer.id
                                      )
                                    }
                                  >
                                    ✖
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Hiển thị lỗi nếu số đáp án < 2 */}
                            {question.answerOptions.length < 2 && (
                              <p className="error-message text-danger">
                                You must add at least 2 answers.
                              </p>
                            )}

                            {/* Hiển thị lỗi nếu không có đáp án đúng */}
                            {question.answerOptions.length > 0 &&
                              question.answerOptions.filter(
                                (answer) => answer.isCorrect
                              ).length === 0 && (
                                <p className="error-message text-danger">
                                  At least one answer must be marked as correct.
                                </p>
                              )}

                            {/* Hiển thị nút Add Answer nếu số đáp án < 5 */}
                            {question.answerOptions.length < 5 && (
                              <button
                                className="btn btn-success"
                                onClick={() =>
                                  handleOpenPopup("Add Answer", (title) =>
                                    handleAddAnswerOption(question.id, title)
                                  )
                                }
                              >
                                Add Answer
                              </button>
                            )}

                            {/* Hiển thị lỗi nếu đã đủ 5 đáp án */}
                            {question.answerOptions.length >= 5 && (
                              <p className="error-message text-warning">
                                You can only add up to 5 answers.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="widget-btn">
            <Link className="btn btn-black prev_btn" onClick={prevTab3}>
              Previous
            </Link>
            <Link className="btn btn-info-light next_btn" onClick={nextTab4}>
              Continue
            </Link>
          </div>
        </div>
      </fieldset>

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

TestQuestion.propTypes = {
  nextTab4: PropTypes.func.isRequired,
  prevTab3: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
};

export default TestQuestion;
