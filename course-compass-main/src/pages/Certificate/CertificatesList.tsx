import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Loader2 } from "lucide-react";
import { platformApi } from "@/api/platform.api";
import { useAuth } from "@/store/AuthContext";
import { CertificateCard } from "@/components/common/CertificateCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

export const CertificatesList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Array<{ id: string; verificationId: string; issuedAt?: string; courseId: string; course: { title: string } }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      const res = await platformApi.certificates();
      setCertificates(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void fetchCertificates();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useRefreshOnFocus(() => {
    if (user) {
      void fetchCertificates();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-shell container py-8 lg:py-10">
      <PageHeader
        icon={Award}
        label="Achievements"
        title="My Certificates"
        description="View, download, and share the certificates you've earned from completing courses on UptoSkills."
      />

      {!user ? (
        <EmptyState
          icon={Award}
          title="Please log in"
          description="Sign in to view your earned certificates."
          actionLabel="Log In"
          actionTo="/login"
        />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete your enrolled courses to earn certificates and show off your new skills!"
          actionLabel="Explore Courses"
          actionTo="/courses"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              id={cert.id}
              verificationId={cert.verificationId}
              courseId={cert.courseId}
              courseTitle={cert.course.title}
              issuedAt={cert.issuedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesList;
