
import { ApplicationStatus, ApplicationActivity, ApplicationPriority, ApplicationCategory, ApplicationSource } from '../branchapplication/branch-application-types';

export type {
  ApplicationStatus,
  ApplicationActivity,
  ApplicationPriority,
  ApplicationCategory,
  ApplicationSource
};

export type ContractStatus = ApplicationStatus;
export type ContractActivity = ApplicationActivity;
export type ContractPriority = ApplicationPriority;
export type ContractCategory = ApplicationCategory;
export type ContractSource = ApplicationSource;

export interface BranchContract {
  id: number;
  Title: string;
  Description: string;
  BranchID: number;
  Source: string;
  Status: string;
  Priority: string;
  Category: string;
  Assigned_to_id: number;
  Assigned_to_Name: string;
  Observers: string;
  Observers_id: string;
  ApplicantName: string;
  ApplicantContact: string;
  Created_at: string;
  UpdatedAt: string;
  Last_action_at: string;
  Created_by_id: number;
  BranchName: string;
  CreatedUserName: string;
  propertyOwnership: string;
  desiredLocation: string;
  latitude?: string;
  longitude?: string;
}
