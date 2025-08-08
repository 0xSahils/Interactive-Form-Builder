import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Users, Calendar, Download } from "lucide-react";
import toast from "react-hot-toast";
import { responseAPI } from "../services/api";

const FormAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchResponses();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const response = await responseAPI.getFormAnalytics(id);
      setAnalytics(response.data.data || null);
    } catch (error) {
      toast.error("Failed to fetch analytics");
      console.error("Error fetching analytics:", error);
      setAnalytics(null);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await responseAPI.getFormResponses(id);
      setResponses(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch responses");
      console.error("Error fetching responses:", error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics || !responses) return;

    const csvData = [];
    const headers = ["Submission Date", "IP Address"];

    // Add question headers
    analytics.form.questions?.forEach((_, index) => {
      headers.push(`Question ${index + 1}`);
    });

    csvData.push(headers);

    // Add response data
    responses.forEach((response) => {
      const row = [
        new Date(response.submittedAt).toLocaleString(),
        response.userInfo?.ipAddress || "N/A",
      ];

      // Add answers for each question
      analytics.form.questions?.forEach((_, questionIndex) => {
        const questionResponse = response.responses.find(
          (r) => r.questionIndex === questionIndex
        );
        if (questionResponse) {
          let answer = "No answer";

          if (questionResponse.categorizeAnswer) {
            answer = questionResponse.categorizeAnswer
              .map((a) => `${a.item}: ${a.selectedCategory}`)
              .join("; ");
          } else if (questionResponse.clozeAnswer) {
            answer = questionResponse.clozeAnswer
              .map((a) => `Blank ${a.blankIndex + 1}: ${a.answer}`)
              .join("; ");
          } else if (questionResponse.comprehensionAnswer) {
            answer = questionResponse.comprehensionAnswer
              .map(
                (a) => `Q${a.questionIndex + 1}: Option ${a.selectedOption + 1}`
              )
              .join("; ");
          }

          row.push(answer);
        } else {
          row.push("No answer");
        }
      });

      csvData.push(row);
    });

    // Convert to CSV and download
    const csvContent = csvData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analytics.form.title}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Analytics not available
          </h2>
          <p className="text-secondary-600 mb-4">
            Unable to load analytics for this form.
          </p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="btn-outline flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-secondary-900">
                  Analytics: {analytics.form.title}
                </h1>
                <p className="text-sm text-secondary-600">
                  Form responses and statistics
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportData}
                className="btn-outline flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600">
                    Total Responses
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {analytics.totalResponses}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600">
                    Questions
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {analytics.questionAnalytics.length}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600">
                    Created
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {new Date(analytics.form.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Question Analytics */}
        <div className="space-y-8">
          {analytics.questionAnalytics.map((questionAnalytic, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Question {questionAnalytic.questionIndex + 1} -{" "}
                  {questionAnalytic.questionType.charAt(0).toUpperCase() +
                    questionAnalytic.questionType.slice(1)}
                </h3>
                <p className="text-sm text-secondary-600">
                  {questionAnalytic.totalResponses} responses
                </p>
              </div>

              <div className="card-content">
                {questionAnalytic.questionType === "categorize" &&
                  questionAnalytic.categoryStats && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-secondary-900">
                        Category Distribution
                      </h4>
                      {Object.entries(questionAnalytic.categoryStats).map(
                        ([item, categories]) => (
                          <div
                            key={item}
                            className="border border-secondary-200 rounded-lg p-4"
                          >
                            <h5 className="font-medium text-secondary-800 mb-2">
                              {item}
                            </h5>
                            <div className="space-y-2">
                              {Object.entries(categories).map(
                                ([category, count]) => (
                                  <div
                                    key={category}
                                    className="flex justify-between items-center"
                                  >
                                    <span className="text-sm text-secondary-600">
                                      {category}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-24 bg-secondary-200 rounded-full h-2">
                                        <div
                                          className="bg-primary-600 h-2 rounded-full"
                                          style={{
                                            width: `${
                                              (count /
                                                questionAnalytic.totalResponses) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium text-secondary-900">
                                        {count}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {questionAnalytic.questionType === "cloze" &&
                  questionAnalytic.blankStats && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-secondary-900">
                        Blank Answers
                      </h4>
                      {Object.entries(questionAnalytic.blankStats).map(
                        ([blankIndex, answers]) => (
                          <div
                            key={blankIndex}
                            className="border border-secondary-200 rounded-lg p-4"
                          >
                            <h5 className="font-medium text-secondary-800 mb-2">
                              Blank {parseInt(blankIndex) + 1}
                            </h5>
                            <div className="space-y-1">
                              {Object.entries(answers)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 10)
                                .map(([answer, count]) => (
                                  <div
                                    key={answer}
                                    className="flex justify-between items-center"
                                  >
                                    <span className="text-sm text-secondary-600 truncate">
                                      {answer}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-16 bg-secondary-200 rounded-full h-2">
                                        <div
                                          className="bg-primary-600 h-2 rounded-full"
                                          style={{
                                            width: `${
                                              (count /
                                                questionAnalytic.totalResponses) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium text-secondary-900">
                                        {count}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {questionAnalytic.questionType === "comprehension" &&
                  questionAnalytic.mcqStats && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-secondary-900">
                        Answer Distribution
                      </h4>
                      {Object.entries(questionAnalytic.mcqStats).map(
                        ([mcqIndex, options]) => (
                          <div
                            key={mcqIndex}
                            className="border border-secondary-200 rounded-lg p-4"
                          >
                            <h5 className="font-medium text-secondary-800 mb-2">
                              MCQ {parseInt(mcqIndex) + 1}
                            </h5>
                            <div className="space-y-2">
                              {Object.entries(options).map(
                                ([optionIndex, count]) => (
                                  <div
                                    key={optionIndex}
                                    className="flex justify-between items-center"
                                  >
                                    <span className="text-sm text-secondary-600">
                                      Option{" "}
                                      {String.fromCharCode(
                                        65 + parseInt(optionIndex)
                                      )}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-24 bg-secondary-200 rounded-full h-2">
                                        <div
                                          className="bg-primary-600 h-2 rounded-full"
                                          style={{
                                            width: `${
                                              (count /
                                                questionAnalytic.totalResponses) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium text-secondary-900">
                                        {count}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Responses */}
        <div className="card mt-8">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">
              Recent Responses
            </h3>
          </div>
          <div className="card-content">
            {responses.length === 0 ? (
              <p className="text-secondary-600 text-center py-8">
                No responses yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Questions Answered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {responses.slice(0, 10).map((response) => (
                      <tr key={response._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                          {new Date(response.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {response.userInfo?.ipAddress || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {response.responses.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormAnalytics;
