import { useParams } from "react-router-dom";
import { useCertificate } from "../../../features/liveExamAttempts/hooks";

export function CertificatePage() {
  const { attemptId } = useParams();
  const { data: cert, isLoading, isError } = useCertificate(Number(attemptId));

  if (isLoading) {
    return (
      <section>
        <p>Loading certificate...</p>
      </section>
    );
  }

  if (isError || !cert) {
    return (
      <section>
        <p>Certificate not available for this attempt.</p>
      </section>
    );
  }

  const percent = Math.round((Number(cert.score) / Number(cert.totalMarks)) * 100);

  return (
    <section className="certificate-page">
      <button type="button" className="btn btn--ghost certificate-page__print-btn" onClick={() => window.print()}>
        🖨 Print / Save as PDF
      </button>

      <div className="certificate">
        <p className="certificate__eyebrow">Certificate of Achievement</p>
        <h1 className="certificate__name">{cert.studentName}</h1>
        <p className="certificate__body">has successfully completed the mock test</p>
        <h2 className="certificate__exam">{cert.examTitle}</h2>

        <div className="certificate__stats">
          <div>
            <strong>
              {cert.score}/{cert.totalMarks}
            </strong>
            <span>Score ({percent}%)</span>
          </div>
          {cert.rank && (
            <div>
              <strong>#{cert.rank}</strong>
              <span>Rank of {cert.totalParticipants}</span>
            </div>
          )}
        </div>

        <p className="certificate__date">
          Issued on {new Date(cert.submittedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </section>
  );
}
