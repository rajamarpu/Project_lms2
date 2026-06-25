import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses } from '../store/slices/courseSlice'

const useFetchCourses = (params = {}) => {
  const dispatch = useDispatch()
  const { courses, loading, error, filters } = useSelector((state) => state.course)

  useEffect(() => {
    dispatch(fetchCourses(params))
  }, [dispatch, params.search, params.category, params.level])

  return {
    courses,
    loading,
    error,
    filters,
    refetch: () => dispatch(fetchCourses(params)),
  }
}

export default useFetchCourses