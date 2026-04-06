import ProgressBar from "./ProgressBar";

function SkillList({ title, skills, emptyText, type }) {
  return (
    <div className="skill-column">
      <h3>{title}</h3>
      {skills.length === 0 ? (
        <p className="empty-text">{emptyText}</p>
      ) : (
        <ul className={`skill-list ${type}`}>
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ResultCard({ result }) {
  if (!result) {
    return null;
  }

  return (
    <section className="result-card">
      <ProgressBar score={result.match_score} />

      <div className="result-grid">
        <SkillList
          title="Found Skills"
          skills={result.found_skills}
          emptyText="No required skills were detected in the resume yet."
          type="found"
        />
        <SkillList
          title="Missing Skills"
          skills={result.missing_skills}
          emptyText="Great! No missing skills for this role."
          type="missing"
        />
      </div>
    </section>
  );
}

export default ResultCard;
