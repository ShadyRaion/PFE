import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Search,
  CheckCircle2,
  User,
  Languages,
  Info,
  Clock,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  ScoreBadge,
  EmptyState,
  LoadingState,
  Field,
  Input,
  Select,
} from "../../components/ui";
import {
  DURATION_FILTERS,
  matchesDurationFilter,
} from "../../utils/filters";

function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState("");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeRecommendations = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.recommendations)) return payload.recommendations;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.scores)) return payload.scores;
    return [];
  };

  const getSubject = (item) => item?.subject || item?.Subject || item || {};

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await api.get("/recommendations");
      const normalized = normalizeRecommendations(res.data);
      setRecommendations(normalized);
      if (normalized.length === 0) {
        setMessage(
          "No recommendation available. Upload your Resume or make sure subjects exist."
        );
      }
    } catch (error) {
      console.error(error);
      setRecommendations([]);
      setMessage(
        "Unable to load recommendations. Upload your Resume to get recommendations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchRecommendations);
  }, [fetchRecommendations]);

  const skillMatches = (skill, item) => {
    const matchedSkills = (item?.matchedSkills || []).map((value) =>
      String(value).toLowerCase()
    );
    return matchedSkills.includes(String(skill).toLowerCase());
  };

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((item) => {
      const subject = getSubject(item);
      const matchedSkills = item?.matchedSkills || [];
      const missingSkills = item?.missingSkills || [];
      const text = [
        subject.title,
        subject.description,
        subject.supervisor?.fullName,
        ...(subject.technologies || []),
        ...(subject.requiredSkills || []),
        ...matchedSkills,
        ...missingSkills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        matchesDurationFilter(subject.duration, durationFilter)
      );
    });
  }, [recommendations, search, durationFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Sparkles}
        title="Recommendations"
        subtitle="Subjects ranked from most compatible to least compatible based on your Resume."
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Search" htmlFor="search" className="lg:col-span-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Subject, technology, skill..."
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Duration" htmlFor="durationFilter">
              <Select
                id="durationFilter"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
              >
                {DURATION_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </CardBody>
      </Card>

      {loading && <LoadingState label="Loading recommendations..." />}

      {!loading && filteredRecommendations.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No recommendation found"
          description="Upload your Resume or adjust your filters to see compatible subjects."
        />
      )}

      {!loading && filteredRecommendations.length > 0 && (
        <section className="space-y-4">
          {filteredRecommendations.map((item, index) => {
            const subject = getSubject(item);
            const score = Number(item?.score || 0);
            const requiredSkills = subject.requiredSkills || [];

            return (
              <Card
                key={item?.id || subject?.id || index}
                onClick={() => subject?.id && navigate(`/subjects/${subject.id}`)}
                className={`transition hover:-translate-y-0.5 hover:shadow-card-hover ${subject?.id ? "cursor-pointer" : ""}`}
              >
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-black text-slate-950 hover:text-cyan-700">
                        {subject.title || "Untitled subject"}
                      </h2>

                      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                        <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Supervisor:{" "}
                        <span className="font-bold text-slate-700">
                          {subject.supervisor?.fullName || "-"}
                        </span>
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Duration:{" "}
                        <span className="font-bold text-slate-700">
                          {subject.duration || "N/A"}
                        </span>
                      </p>
                    </div>

                    <ScoreBadge score={score} size="lg" />
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-700">
                    {subject.description || "No description."}
                  </p>

                  {requiredSkills.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Required skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {requiredSkills.map((skill) => {
                          const matched = skillMatches(skill, item);
                          return (
                            <Badge
                              key={skill}
                              variant={matched ? "success" : "neutral"}
                              icon={matched ? CheckCircle2 : undefined}
                            >
                              {skill}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(item?.recommendationReason || item?.scoreBreakdown) && (
                    <div className="mt-5 rounded-xl border border-[#cfe1e8] bg-[#f1f8fc] p-4">
                      {item?.recommendationReason && (
                        <p className="text-sm leading-6 text-slate-700">
                          <span className="font-bold text-slate-900">
                            Why:{" "}
                          </span>
                          {item.recommendationReason}
                        </p>
                      )}

                      {item?.scoreBreakdown && (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            { key: "technical", label: "Technical" },
                            { key: "domain", label: "Domain" },
                            { key: "languages", label: "Languages" },
                            { key: "softSkills", label: "Soft skills" },
                          ].map(({ key, label }) => {
                            const value = Number(
                              item.scoreBreakdown[key] || 0
                            );
                            return (
                              <div key={key}>
                                <div className="mb-1 flex justify-between text-xs">
                                  <span className="font-semibold text-slate-600">
                                    {label}
                                  </span>
                                  <span className="font-bold text-slate-900">
                                    {value}
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white">
                                  <div
                                    className="h-full rounded-full bg-cyan-600 transition-all"
                                    style={{
                                      width: `${Math.min(100, value * 2)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {Array.isArray(item?.matchedLanguages) &&
                        item.matchedLanguages.length > 0 && (
                          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-600">
                            <Languages
                              className="h-3.5 w-3.5"
                              strokeWidth={2.5}
                            />
                            <span className="font-bold text-slate-900">
                              Languages matched:
                            </span>{" "}
                            {item.matchedLanguages.join(", ")}
                          </p>
                        )}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Recommendations;
