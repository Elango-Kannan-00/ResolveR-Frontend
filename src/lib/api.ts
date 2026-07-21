const RAW_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8080";
export const API_BASE = RAW_BASE.replace(/\/$/, "");

export type UserRole = "STUDENT" | "HOD" | "PRINCIPAL" | "EXECUTIVE_CHAIRMAN";
export type ComplaintStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";
export type DepartmentType = "COMMON" | "ACADEMIC";

export interface UserResponseDto {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: UserRole;
}

export interface AcademicDepartmentDto {
  academicDepartmentId: number;
  academicDepartmentName: string;
}

export interface ComplaintDepartmentDto {
  complaintDepartmentId: number;
  complaintDepartmentName: string;
  departmentType: DepartmentType;
}

export interface ComplaintResponseDto {
  complaintId: number;
  complaintTitle: string;
  complaintDescription: string;
  complaintStatus: ComplaintStatus;
  departmentName: string;
  createdAt: string;
  updatedAt: string;
  feedback: string | null;
}

export interface HodComplaintResponseDto {
  complaintId: number;
  complaintTitle: string;
  complaintDescription: string;
  studentName: string;
  complaintStatus: ComplaintStatus;
  departmentName: string;
  createdAt: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    let message = text || res.statusText;
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || message;
    } catch {}
    throw new Error(message);
  }
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  register: (body: { userName: string; userEmail: string; userPassword: string; academicDepartmentId: number }) =>
    request<UserResponseDto>("/user/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { userEmail: string; userPassword: string }) =>
    request<UserResponseDto>("/user/login", { method: "POST", body: JSON.stringify(body) }),

  getUserProfileByEmail: (email: string) =>
    request<UserResponseDto>(`/user/profile?email=${encodeURIComponent(email)}`),

  getAcademicDepartments: () =>
    request<AcademicDepartmentDto[]>("/departments/academic-departments"),

  getComplaintDepartments: (studentId: number) =>
    request<ComplaintDepartmentDto[]>(`/departments/complaint-departments/${studentId}`),

  getStudentComplaints: (studentId: number) =>
    request<ComplaintResponseDto[]>(`/complaints/${studentId}`),

  createComplaint: (
    studentId: number,
    body: { complaintTitle: string; complaintDescription: string; complaintDepartmentId: number },
  ) =>
    request<ComplaintResponseDto>(`/complaints/${studentId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateComplaint: (
    complaintId: number,
    body: { complaintTitle: string; complaintDescription: string },
  ) =>
    request<ComplaintResponseDto>(`/complaints/${complaintId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteComplaint: (complaintId: number) =>
    request<string>(`/complaints/${complaintId}`, { method: "DELETE" }),

  submitFeedback: (complaintId: number, feedback: string) =>
    request<string>(`/complaints/${complaintId}/feedback`, {
      method: "PUT",
      body: JSON.stringify({ feedback }),
    }),

  getHodComplaints: (hodId: number) =>
    request<HodComplaintResponseDto[]>(`/hod/${hodId}/complaints`),

  updateComplaintStatus: (complaintId: number, complaintStatus: ComplaintStatus) =>
    request<string>(`/hod/complaints/${complaintId}/status`, {
      method: "PUT",
      body: JSON.stringify({ complaintStatus }),
    }),
};
