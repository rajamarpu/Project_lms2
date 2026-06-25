import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CourseCard from '../../components/ui/CourseCard'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import useDebounce from '../../hooks/useDebounce'
import {
  clearCourseFilters,
  fetchCourses,
  setCourseFilters,
} from '../../store/slices/courseSlice'

const personalities = [
  'Shah Rukh Khan',
  'Deepika Padukone',
  'Ranveer Singh',
  'Alia Bhatt',
  'Akshay Kumar',
]

const categories = ['All', 'CSS', 'Python', 'MERN', 'JavaScript']
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

const CourseList = () => {
  const dispatch = useDispatch()
  const { courses, loading, filters } = useSelector((state) => state.course)

  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  useEffect(() => {
    dispatch(
      setCourseFilters({
        search: debouncedSearch,
      }),
    )
  }, [debouncedSearch, dispatch])

  useEffect(() => {
    dispatch(fetchCourses(filters))
  }, [dispatch, filters])

  const featuredCourses = useMemo(() => courses.slice(0, 3), [courses])

  const handleCategoryChange = (category) => {
    dispatch(
      setCourseFilters({
        category: category === 'All' ? '' : category,
      }),
    )
  }

  const handleLevelChange = (e) => {
    dispatch(
      setCourseFilters({
        level: e.target.value === 'All' ? '' : e.target.value,
      }),
    )
  }

  const handleClearFilters = () => {
    setSearchInput('')
    dispatch(clearCourseFilters())
    dispatch(fetchCourses({}))
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 text-white shadow-2xl lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.18),transparent_26%)]" />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
              Learn smarter
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight lg:text-6xl">
              Explore immersive AI-powered tech courses built for modern learners.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Discover premium learning tracks in Python, CSS, MERN Stack, and modern
              development with interactive content, sleek UI, and virtual celebrity-style
              teaching experiences.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="flex w-full items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
                <input
                  type="text"
                  placeholder="Search by course title or keyword..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={filters.level || 'All'}
                onChange={handleLevelChange}
                className="min-h-[52px] rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none backdrop-blur-xl"
              >
                {levels.map((level) => (
                  <option key={level} value={level} className="text-slate-900">
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {categories.map((item) => {
                const active = (filters.category || 'All') === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleCategoryChange(item)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-white text-slate-950'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm text-cyan-300">Popular tracks</p>
              <div className="mt-4 grid gap-3">
                {['Frontend Engineering', 'Full Stack MERN', 'Python Essentials'].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm text-cyan-300">Switch virtual teacher</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {personalities.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-white/10 px-3 py-2 text-xs text-slate-200"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
              Featured programs
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Handpicked learning journeys
            </h2>
          </div>

          <Button variant="secondary" onClick={handleClearFilters}>
            Reset Filters
          </Button>
        </div>

        {loading ? (
          <Spinner text="Loading featured courses..." />
        ) : featuredCourses.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">No featured courses found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try updating your search or filter options.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
            Course catalog
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Browse all available courses
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Smart filters, elegant cards, and modern catalog UI designed for faster course discovery.
          </p>
        </div>

        {loading ? (
          <Spinner text="Loading course catalog..." />
        ) : courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center backdrop-blur">
            <h3 className="text-xl font-semibold text-slate-900">No courses matched your search</h3>
            <p className="mt-2 text-sm text-slate-500">
              Adjust category, level, or search terms to explore more courses.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default CourseList