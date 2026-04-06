function RoleSelector({ value, onChange, roles }) {
  return (
    <div className="field-group">
      <label htmlFor="roleSelector" className="field-label">Target Role</label>
      <select
        id="roleSelector"
        className="select-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select a role...</option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RoleSelector;
