package backend.entity.Project;

public enum ProjectMemberRoleType {
    LEADER, MEMBER;

    public static ProjectMemberRoleType fromString(String value) {
        if (value == null)  return null;
        try {
            return ProjectMemberRoleType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
