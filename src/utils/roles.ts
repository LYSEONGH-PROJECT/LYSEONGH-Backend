// src/utils/roles.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  VIEWER = 'VIEWER',
}

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

export const hasAtLeastRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = [UserRole.VIEWER, UserRole.TECHNICIAN, UserRole.ADMIN];
  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);
  return userIndex >= requiredIndex;
};