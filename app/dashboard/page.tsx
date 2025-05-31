"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Video, GraduationCap, Briefcase, Calendar, Clock, CheckCircle, XCircle, LogOut, Plus, User } from "lucide-react";

interface Interview {
  id: string;
  type: string;
  status: string;
  jobTitle?: string;
  company?: string;
  visaType?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  feedback?: {
    overallScore?: number;
  };
  _count: {
    questions: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchInterviews();
    }
  }, [session]);

  const fetchInterviews = async () => {
    try {
      const response = await fetch("/api/interviews");
      const data = await response.json();
      if (response.ok) {
        setInterviews(data);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    if (type.startsWith("VISA")) {
      return <GraduationCap className="h-5 w-5" />;
    }
    return <Briefcase className="h-5 w-5" />;
  };

  const getInterviewTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      VISA_F1: "Student Visa (F-1)",
      VISA_B2: "Tourist Visa (B-2)",
      VISA_H1B: "Work Visa (H-1B)",
      JOB_HR: "HR Interview",
      JOB_TECHNICAL: "Technical Interview",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { icon: CheckCircle, color: "text-green-600 bg-green-50", label: "Completed" },
      IN_PROGRESS: { icon: Clock, color: "text-yellow-600 bg-yellow-50", label: "In Progress" },
      CANCELLED: { icon: XCircle, color: "text-red-600 bg-red-50", label: "Cancelled" },
      FAILED: { icon: XCircle, color: "text-red-600 bg-red-50", label: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.CANCELLED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI Video Interviewer</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{session?.user?.name || session?.user?.email}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name || "User"}!
          </h1>
          <p className="text-gray-600">
            Track your interview practice sessions and improve your performance
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/visa-interview">
            <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-4">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice VISA Interview</h3>
                  <p className="text-gray-600">Prepare for your US visa interview with AI</p>
                </div>
                <Plus className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/job-interview">
            <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex p-3 rounded-lg bg-purple-100 mb-4">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice Job Interview</h3>
                  <p className="text-gray-600">Get ready for your dream job interview</p>
                </div>
                <Plus className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Interview History */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Interview History</h2>
          
          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No interviews yet</p>
              <p className="text-gray-500">Start practicing with our AI interviewers to see your progress here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    {/* <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getInterviewTypeIcon(interview.type)}
                          <span className="font-medium text-gray-900">
                            {getInterviewTypeLabel(interview.type)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {interview.jobTitle ? (
                          <div>
                            <p className="font-medium text-gray-900">{interview.jobTitle}</p>
                            <p className="text-sm text-gray-600">{interview.company}</p>
                          </div>
                        ) : (
                          <span className="text-gray-600">{interview.visaType || "-"}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {interview.startedAt
                              ? new Date(interview.startedAt).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                      </td>
                      {/* <td className="py-4 px-4">{getStatusBadge(interview.status)}</td>
                      <td className="py-4 px-4">
                        {interview.feedback?.overallScore ? (
                          <span className="font-semibold text-gray-900">
                            {interview.feedback.overallScore}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{interview._count.questions}</span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 