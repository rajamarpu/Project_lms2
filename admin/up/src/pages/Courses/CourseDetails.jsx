import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import { enrollInCourse } from '../../store/slices/courseSlice'
import { toastMessage } from '../../utils/toastMessage'
import { formatCurrency } from '../../utils/formatCurrency'

const teachers = [
  'Shah Rukh Khan',
  'Deepika Padukone',
  'Ranveer Singh',
  'Alia Bhatt',
  'Akshay Kumar',
]

const syllabus = [
  'Introduction and course roadmap',
  'Core concepts with practical examples',
  'Hands-on project implementation',
  'Responsive UI and real-world workflows',
  'Advanced topics and capstone delivery',
]

const reviews = [
  {
    id: 1,
    name: 'Aarav Mehta',
    role: 'Frontend Learner',
    comment: 'Excellent visual structure and the teacher-switch idea makes the course feel unique.',
  },
  {
    id: 2,
    name: 'Riya Sharma',
    role: 'Full Stack Student',
    comment: 'The interface is clean, motivating, and very easy to navigate on mobile too.',
  },
]

const CourseDetails = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { courses } = useSelector((state) => state.course)

  const course = useMemo(() => courses.find((item) => item.id === id) || courses[0], [courses, id])

  const [selectedTeacher, setSelectedTeacher] = useState('Shah Rukh Khan')
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)

  if (!course) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Course not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The requested course is currently unavailable.
        </p>
      </div>
    )
  }

  const handleEnroll = () => {
    dispatch(enrollInCourse(course))
    toastMessage.success(`Enrolled in ${course.title}`)
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/40 bg-white/70 shadow-xl backdrop-blur-2xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 lg:p-8">
            <div className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              {course.category} • {course.level}
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              {course.title}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {course.description} This course is crafted with a premium LMS feel and allows
              learners to switch AI-powered virtual teacher personalities anytime during the journey.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-4 py-2">⭐ {course.rating} Rating</span>
              <span className="rounded-full bg-slate-100 px-4 py-2">{course.students} Students</span>
              <span className="rounded-full bg-slate-100 px-4 py-2">{course.duration}</span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Card className="rounded-3xl border border-slate-200 bg-white/70 p-5">
                <p className="text-sm text-slate-500">Hands-on Modules</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">24+</h3>
              </Card>

              <Card className="rounded-3xl border border-slate-200 bg-white/70 p-5">
                <p className="text-sm text-slate-500">Projects</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">6</h3>
              </Card>

              <Card className="rounded-3xl border border-slate-200 bg-white/70 p-5">
                <p className="text-sm text-slate-500">Certificate</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">Included</h3>
              </Card>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Current virtual teacher</p>
              <h3 className="mt-2 text-2xl font-bold">{selectedTeacher}</h3>
              <p className="mt-2 text-sm text-slate-200">
                Voice and appearance style will reflect the selected personality while content remains AI-generated.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
              What you&apos;ll learn
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Course outcomes</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                'Build strong conceptual understanding',
                'Apply learning through guided projects',
                'Understand real-world workflow patterns',
                'Create portfolio-ready practical work',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
              Curriculum
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Syllabus overview</h2>

            <div className="mt-6 space-y-4">
              {syllabus.map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Structured module with guided explanation, practical implementation, and learner checkpoints.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
              Learner feedback
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Student reviews</h2>

            <div className="mt-6 grid gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{review.name}</h3>
                      <p className="text-sm text-slate-500">{review.role}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      5.0
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <div className="sticky top-24 space-y-6">
            <Card className="rounded-[28px] bg-slate-950 p-6 text-white shadow-2xl">
              <p className="text-sm text-slate-400">Course price</p>
              <h2 className="mt-2 text-4xl font-bold">
                {course.price === 0 ? 'Free' : formatCurrency(course.price)}
              </h2>

              <div className="mt-6 space-y-3">
                <Button fullWidth size="lg" onClick={handleEnroll}>
                  Enroll Now
                </Button>

                <Button
                  fullWidth
                  size="lg"
                  variant="secondary"
                  className="border-white/15 bg-white/10 text-white hover:bg-white/15"
                  onClick={() => setIsTeacherModalOpen(true)}
                >
                  Switch Teacher
                </Button>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <p>• Lifetime access to UI course content</p>
                <p>• Project-based structured modules</p>
                <p>• Dynamic AI teacher switching experience</p>
                <p>• Mobile and desktop optimized learning flow</p>
              </div>
            </Card>

            <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
                Selected teacher
              </p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">{selectedTeacher}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Personalize your course presentation style anytime during the learning journey.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        title="Choose your virtual teacher"
        size="md"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {teachers.map((teacher) => {
            const active = selectedTeacher === teacher

            return (
              <button
                key={teacher}
                type="button"
                onClick={() => {
                  setSelectedTeacher(teacher)
                  setIsTeacherModalOpen(false)
                  toastMessage.info(`${teacher} selected as virtual teacher`)
                }}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{teacher}</p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  AI-generated content with realistic voice and visual style inspiration.
                </p>
              </button>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}

export default CourseDetails