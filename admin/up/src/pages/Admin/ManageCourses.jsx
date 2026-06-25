import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { toastMessage } from '../../utils/toastMessage'

const ManageCourses = () => {
  const { courses } = useSelector((state) => state.course)
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      [course.title, course.category, course.level].some((field) =>
        field.toLowerCase().includes(search.toLowerCase()),
      ),
    )
  }, [courses, search])

  const handlePublishToggle = (course) => {
    toastMessage.info(`${course.title} status updated`)
  }

  const handleDeleteCourse = () => {
    toastMessage.success(`${selectedCourse?.title} removed from UI list`)
    setSelectedCourse(null)
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Admin / courses</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Manage courses</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review course inventory, monitor status, and control your learning catalog layout.
          </p>
        </div>

        <div className="w-full md:max-w-sm">
          <Input
            name="courseSearch"
            placeholder="Search by title, category or level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden rounded-[28px] bg-white/80 p-0 backdrop-blur-xl"
            hoverable
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-52 w-full object-cover"
            />

            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {course.category}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {course.level}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">{course.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{course.description}</p>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                <span>{course.students} learners</span>
                <span>⭐ {course.rating}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handlePublishToggle(course)}>
                  Publish
                </Button>
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => setSelectedCourse(course)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredCourses.length === 0 && (
          <Card className="rounded-[28px] bg-white/80 text-center backdrop-blur-xl lg:col-span-2 xl:col-span-3">
            <h3 className="text-xl font-semibold text-slate-900">No courses found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try a different keyword to search in the course catalog.
            </p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title="Delete course"
        showFooter
        confirmText="Delete Course"
        confirmVariant="danger"
        onConfirm={handleDeleteCourse}
      >
        <p className="text-sm leading-7 text-slate-600">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-slate-900">{selectedCourse?.title}</span> from the
          catalog UI?
        </p>
      </Modal>
    </div>
  )
}

export default ManageCourses