import { Link } from 'react-router-dom'
import Card from '../common/Card'
import Button from '../common/Button'
import { formatCurrency } from '../../utils/formatCurrency'

const CourseCard = ({ course }) => {
  return (
    <Card className="group overflow-hidden border-0 bg-white/85 p-0 backdrop-blur-xl" hoverable>
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {course.category}
          </span>
          <span className="rounded-full bg-teal-400/15 px-3 py-1 text-xs font-medium text-teal-200 backdrop-blur">
            {course.level}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
            AI Virtual Mentor
          </p>
          <h3 className="mt-2 line-clamp-2 text-xl font-bold text-white">
            {course.title}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
          {course.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>⭐ {course.rating}</span>
          <span>{course.students} Students</span>
          <span>{course.duration}</span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Starting from</p>
            <p className="text-xl font-bold text-slate-900">
              {course.price === 0 ? 'Free' : formatCurrency(course.price)}
            </p>
          </div>

          <Link to={`/courses/${course.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default CourseCard