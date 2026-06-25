import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const demoCourses = [
  {
    id: '1',
    title: 'Master Modern CSS with AI Virtual Mentor',
    description:
      'Learn responsive layouts, animations, flexbox, grid, and production-ready CSS design systems.',
    category: 'CSS',
    level: 'Beginner',
    rating: 4.8,
    students: 12840,
    duration: '8 Weeks',
    price: 1999,
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '2',
    title: 'Python From Scratch to Advanced Projects',
    description:
      'Build strong Python fundamentals and practical project experience for real-world problem solving.',
    category: 'Python',
    level: 'Intermediate',
    rating: 4.9,
    students: 18300,
    duration: '10 Weeks',
    price: 2499,
    thumbnail:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '3',
    title: 'MERN Stack Job Ready Bootcamp',
    description:
      'Frontend to backend journey with MongoDB, Express, React, and Node in one guided program.',
    category: 'MERN',
    level: 'Advanced',
    rating: 4.7,
    students: 9650,
    duration: '12 Weeks',
    price: 3999,
    thumbnail:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '4',
    title: 'JavaScript UI Engineering Essentials',
    description:
      'Understand components, DOM workflows, async behavior, and UI architecture for frontend apps.',
    category: 'JavaScript',
    level: 'Beginner',
    rating: 4.6,
    students: 7440,
    duration: '6 Weeks',
    price: 1499,
    thumbnail:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
  },
]

export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { search = '', category = '', level = '' } = params

      const filteredCourses = demoCourses.filter((course) => {
        const searchMatch =
          !search ||
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.description.toLowerCase().includes(search.toLowerCase())

        const categoryMatch = !category || course.category === category
        const levelMatch = !level || course.level === level

        return searchMatch && categoryMatch && levelMatch
      })

      return filteredCourses
    } catch (error) {
      return rejectWithValue('Failed to fetch courses.')
    }
  },
)

const courseSlice = createSlice({
  name: 'course',
  initialState: {
    loading: false,
    courses: [],
    selectedCourse: null,
    enrolledCourses: [],
    filters: {
      search: '',
      category: '',
      level: '',
    },
    error: null,
  },
  reducers: {
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload
    },
    setCourseFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },
    clearCourseFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        level: '',
      }
    },
    enrollInCourse: (state, action) => {
      const alreadyEnrolled = state.enrolledCourses.find(
        (course) => course.id === action.payload.id,
      )

      if (!alreadyEnrolled) {
        state.enrolledCourses.push(action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setSelectedCourse,
  setCourseFilters,
  clearCourseFilters,
  enrollInCourse,
} = courseSlice.actions

export default courseSlice.reducer