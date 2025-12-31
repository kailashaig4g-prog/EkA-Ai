import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, GraduationCap, Clock, BookOpen, 
  Award, Play, CheckCircle2, Trophy
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { arjunAPI } from '../services/api';
import { toast } from 'sonner';

const CourseCard = ({ course, userProgress }) => {
  const progress = userProgress?.current_course?.id === course.id 
    ? userProgress.current_course.progress 
    : 0;
  const isStarted = progress > 0;
  const isCompleted = progress >= 100;

  return (
    <Card className="p-5 hover:border-emerald-500/50 transition-colors" data-testid={`course-${course.id}`}>
      <div className="flex items-start justify-between mb-3">
        <Badge variant={
          course.level === 'Beginner' ? 'success' : 
          course.level === 'Intermediate' ? 'warning' : 'error'
        }>
          {course.level}
        </Badge>
        {course.has_certification && (
          <Award className="w-5 h-5 text-amber-400" />
        )}
      </div>

      <h3 className="font-poppins text-lg font-medium text-white mb-2">{course.title}</h3>
      <p className="text-white/60 text-sm mb-4 line-clamp-2">{course.description}</p>

      <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {course.duration_hours}h
        </div>
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {course.modules} modules
        </div>
      </div>

      {isStarted && !isCompleted && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <Button 
        variant={isCompleted ? 'secondary' : isStarted ? 'default' : 'secondary'} 
        className="w-full"
        data-testid={`course-action-${course.id}`}
      >
        {isCompleted ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Completed
          </>
        ) : isStarted ? (
          <>
            <Play className="w-4 h-4 mr-2" />
            Resume
          </>
        ) : (
          <>
            <GraduationCap className="w-4 h-4 mr-2" />
            Enroll Now
          </>
        )}
      </Button>
    </Card>
  );
};

export default function Arjun() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, progressRes] = await Promise.all([
        arjunAPI.getCourses(),
        arjunAPI.getProgress(),
      ]);
      setCourses(coursesRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      toast.error('Failed to load training data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    if (activeTab === 'all') return true;
    return c.category.toLowerCase() === activeTab.toLowerCase();
  });

  const categories = ['all', 'Technical', 'Compliance', 'Management', 'Safety'];

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="arjun-dashboard">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" data-testid="back-btn">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-poppins text-xl font-semibold text-white">ARJUN - Training Intelligence</h1>
                <p className="text-white/60 text-sm">Chief Agent: AG_SARASWATI • SARASWATI</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" data-testid="my-progress-btn">
              <Trophy className="w-4 h-4 mr-2" />
              My Progress
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Current Course Banner */}
        {progress?.current_course && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30" data-testid="current-course-banner">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <Badge variant="success" className="mb-3">Currently Learning</Badge>
                <h2 className="font-poppins text-xl font-medium text-white mb-2">
                  {progress.current_course.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>{progress.current_course.modules_completed}/{progress.current_course.modules_total} modules completed</span>
                  <span>•</span>
                  <span>{progress.current_course.progress}% complete</span>
                </div>
                <div className="mt-4 max-w-md">
                  <Progress value={progress.current_course.progress} className="h-3" />
                </div>
              </div>
              <Button className="shrink-0" data-testid="continue-learning-btn">
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4" data-testid="stat-hours">
            <Clock className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{progress?.total_hours || 0}h</p>
            <p className="text-white/50 text-sm">Total Learning</p>
          </Card>
          <Card className="p-4" data-testid="stat-completed">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{progress?.courses_completed || 0}</p>
            <p className="text-white/50 text-sm">Courses Completed</p>
          </Card>
          <Card className="p-4" data-testid="stat-certifications">
            <Award className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{progress?.certifications?.length || 0}</p>
            <p className="text-white/50 text-sm">Certifications</p>
          </Card>
          <Card className="p-4" data-testid="stat-available">
            <BookOpen className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-2xl font-semibold text-white">{courses.length}</p>
            <p className="text-white/50 text-sm">Available Courses</p>
          </Card>
        </div>

        {/* Certifications */}
        {progress?.certifications?.length > 0 && (
          <section className="mb-8">
            <h2 className="font-poppins text-xl font-medium text-white mb-4">Your Certifications</h2>
            <div className="flex flex-wrap gap-3">
              {progress.certifications.map((cert, index) => (
                <Card key={index} className="p-4 inline-flex items-center gap-3" data-testid={`cert-${index}`}>
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{cert.name}</p>
                    <p className="text-white/50 text-xs">Issued: {cert.issued_date}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-poppins text-xl font-medium text-white">Available Courses</h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} data-testid={`tab-${cat}`}>
                  {cat === 'all' ? 'All' : cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-64 animate-pulse bg-white/5" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} userProgress={progress} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
