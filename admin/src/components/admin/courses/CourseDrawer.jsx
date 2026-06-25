import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdUploadFile, MdBook, MdTitle, MdDescription,
  MdLayers, MdCategory, MdTimer, MdLanguage, MdPerson,
  MdAttachMoney, MdLocalOffer, MdSchool, MdAssignment,
  MdCheckCircle, MdSearch, MdKeyboardArrowDown
} from 'react-icons/md';
import { platformAdminApi } from '../../../api/platform';
import {
  COURSE_CATEGORY_OPTIONS,
  COURSE_TYPE_OPTIONS,
} from '../../../utils/courseUtils';

// Level Options
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Static fallback teachers in case local storage is not populated
const DEFAULT_TEACHERS = [
  { id: 1, name: 'Salman Khan' },
  { id: 2, name: 'Virat Kohli' },
  { id: 3, name: 'Sachin Tendulkar' },
  { id: 4, name: 'Anushka Sharma' },
  { id: 5, name: 'Katrina Kaif' }
];

const DropdownField = ({
  icon: Icon,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  placeholder = 'Select an option'
}) => (
  <div className="relative" data-dropdown-root="true">
    <button
      type="button"
      onClick={onToggle}
      className={`admin-drawer-input flex min-h-[50px] w-full items-center gap-3 pl-11 pr-11 text-left ${
        isOpen ? 'admin-drawer-input-open' : ''
      }`}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      <span className={value ? 'text-[var(--admin-text-primary)]' : 'text-[var(--admin-text-muted)]'}>
        {value || placeholder}
      </span>
      <MdKeyboardArrowDown
        className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
        size={20}
      />
    </button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="absolute z-50 left-0 right-0 mt-2 overflow-hidden rounded-xl border bg-[var(--admin-surface-raised)] shadow-2xl"
          style={{ borderColor: 'var(--admin-border)' }}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-all ${
                  isSelected
                    ? 'bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent)]'
                    : 'text-[var(--admin-text-primary)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <span>{option}</span>
                {isSelected && <MdCheckCircle size={16} className="text-[var(--accent)]" />}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const CourseDrawer = ({ isOpen, onClose, onSave, courseToEdit }) => {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    shortDesc: '',
    fullDesc: '',
    level: 'Beginner',
    category: 'Web Development',
    courseType: COURSE_TYPE_OPTIONS['Web Development']?.[0] || 'Frontend',
    duration: '',
    language: 'English',
    status: 'Published', // Draft, Published, Archived
    teacher: '',
    price: '',
    discountPrice: '',
    lessons: '',
    projects: '',
    certificate: true,
    visibility: 'Public', // Public, Private
    featured: false,
    avatar: null,
    thumbnail: null
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [teachers, setTeachers] = useState(DEFAULT_TEACHERS);
  const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const teacherDropdownRef = useRef(null);

  // Load actual teachers from local storage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lms_teachers_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeachers(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load teachers for course dropdown:", e);
    }
  }, [isOpen]);

  // Set default teacher if not editing
  useEffect(() => {
    if (teachers.length > 0 && !courseToEdit && !form.teacher) {
      setForm(prev => ({ ...prev, teacher: teachers[0].name }));
    }
  }, [teachers, courseToEdit]);

  // Handle outside click to close searchable teacher dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-dropdown-root="true"]')) {
        setActiveDropdown(null);
      }
      if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(e.target)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Prepopulate if editing
  useEffect(() => {
    if (courseToEdit) {
      setForm({
        title: courseToEdit.title || '',
        slug: courseToEdit.slug || (courseToEdit.title ? courseToEdit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
        shortDesc: courseToEdit.shortDesc || 'Learn advanced concepts and real-world techniques.',
        fullDesc: courseToEdit.fullDesc || 'Detailed curriculum covering all fundamentals and best practices.',
        level: courseToEdit.level || 'Beginner',
        category: courseToEdit.category || 'Web Development',
        courseType:
          courseToEdit.courseType ||
          COURSE_TYPE_OPTIONS[courseToEdit.category || 'Web Development']?.[0] ||
          'Frontend',
        duration: courseToEdit.hours || courseToEdit.duration || '30',
        language: courseToEdit.language || 'English',
        status: courseToEdit.status || (courseToEdit.active ? 'Published' : 'Draft'),
        teacher: courseToEdit.teacher || (courseToEdit.mentorName || 'Salman Khan'),
        price: courseToEdit.price || '499',
        discountPrice: courseToEdit.discountPrice || '299',
        lessons: courseToEdit.lessons || '15',
        projects: courseToEdit.projects || '3',
        certificate: courseToEdit.certificate !== undefined ? courseToEdit.certificate : true,
        visibility: courseToEdit.visibility || 'Public',
        featured: courseToEdit.featured !== undefined ? courseToEdit.featured : false,
        avatar: courseToEdit.avatar || courseToEdit.thumbnail || null,
        thumbnail: courseToEdit.thumbnail || courseToEdit.avatar || null
      });
      setAvatarPreview(courseToEdit.thumbnail || courseToEdit.avatar || null);
      setErrors({});
      setActiveDropdown(null);
    } else {
      // Reset form
      setForm({
        title: '',
        slug: '',
        shortDesc: '',
        fullDesc: '',
        level: 'Beginner',
        category: 'Web Development',
        courseType: COURSE_TYPE_OPTIONS['Web Development']?.[0] || 'Frontend',
        duration: '',
        language: 'English',
        status: 'Published',
        teacher: teachers[0]?.name || '',
        price: '',
        discountPrice: '',
        lessons: '',
        projects: '',
        certificate: true,
        visibility: 'Public',
        featured: false,
        avatar: null,
        thumbnail: null
      });
      setAvatarPreview(null);
      setErrors({});
      setActiveDropdown(null);
    }
  }, [courseToEdit, isOpen, teachers]);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-generate Slug from Title
  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    const generatedSlug = titleVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
      .replace(/\s+/g, '-'); // collapse spaces to hyphens

    setErrors(prev => ({ ...prev, title: undefined }));
    setForm(prev => ({
      ...prev,
      title: titleVal,
      slug: generatedSlug
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setIsUploadingImage(true);
    setErrors(prev => ({ ...prev, thumbnail: undefined }));

    try {
      const response = await platformAdminApi.uploadImage(file);
      const uploadedUrl = response?.url;

      if (!uploadedUrl) {
        throw new Error('Image upload did not return a file URL.');
      }

      setForm(prev => ({
        ...prev,
        avatar: uploadedUrl,
        thumbnail: uploadedUrl
      }));
    } catch (error) {
      console.error('Course thumbnail upload failed:', error);
      setAvatarPreview(courseToEdit?.thumbnail || courseToEdit?.avatar || null);
      setForm(prev => ({
        ...prev,
        avatar: courseToEdit?.avatar || null,
        thumbnail: courseToEdit?.thumbnail || null
      }));
      setErrors(prev => ({
        ...prev,
        thumbnail: error?.response?.data?.message || error.message || 'Failed to upload the course image.'
      }));
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSave = (statusOverride) => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Course name is required.';
    if (!form.shortDesc.trim()) nextErrors.shortDesc = 'Short description is required.';
    if (form.discountPrice && form.price && Number(form.discountPrice) > Number(form.price)) {
      nextErrors.discountPrice = 'Discount price should not exceed the base price.';
    }
    if (isUploadingImage) nextErrors.thumbnail = 'Please wait for the image upload to finish.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const submissionStatus = statusOverride || form.status;

    // Create random or custom gradient if adding new
    const gradients = [
      'from-blue-600 via-blue-500 to-cyan-400',
      'from-amber-500 via-orange-500 to-red-500',
      'from-emerald-500 via-teal-500 to-green-400',
      'from-purple-600 via-violet-500 to-pink-500',
      'from-rose-500 via-pink-500 to-fuchsia-500',
      'from-slate-600 via-slate-500 to-gray-400',
      'from-cyan-500 via-sky-500 to-blue-500',
      'from-indigo-600 via-purple-600 to-blue-500'
    ];

    const categoryIcons = {
      'DSA': '🔢',
      'Web Development': '⚛️',
      'Mobile Development': '📱',
      'AI/ML': '🧠',
      'DevOps': '☁️',
      'Programming Languages': '💻'
    };

    const gradient = courseToEdit?.gradient || gradients[Math.floor(Math.random() * gradients.length)];
    const icon = courseToEdit?.icon || categoryIcons[form.category] || '📚';

    const savedCourse = {
      ...courseToEdit,
      id: courseToEdit ? courseToEdit.id : Date.now(),
      title: form.title,
      slug: form.slug,
      shortDesc: form.shortDesc,
      fullDesc: form.fullDesc,
      level: form.level,
      category: form.category,
      courseType: form.courseType,
      lessons: parseInt(form.lessons) || 12,
      projects: parseInt(form.projects) || 2,
      certificate: form.certificate,
      visibility: form.visibility,
      featured: form.featured,
      duration: form.duration || '30',
      hours: parseInt(form.duration) || 30,
      language: form.language,
      status: submissionStatus,
      active: submissionStatus === 'Published',
      teacher: form.teacher,
      price: form.price || '499',
      discountPrice: form.discountPrice || '299',
      gradient,
      icon,
      avatar: form.avatar,
      thumbnail: form.thumbnail || form.avatar,
      rating: courseToEdit?.rating || 4.8,
      students: courseToEdit?.students || 0,
      completion: courseToEdit?.completion || 0
    };

    onSave(savedCourse);
    onClose();
  };

  const set = (key) => (e) => {
    setErrors(prev => ({ ...prev, [key]: undefined }));
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const selectDropdownValue = (key, value) => {
    setErrors(prev => ({ ...prev, [key]: undefined }));
    setForm(prev => {
      if (key === 'category') {
        const nextTypes = COURSE_TYPE_OPTIONS[value] || [];
        return {
          ...prev,
          category: value,
          courseType: nextTypes.includes(prev.courseType) ? prev.courseType : nextTypes[0] || ''
        };
      }

      return { ...prev, [key]: value };
    });
    setActiveDropdown(null);
  };

  // Filtered teachers list based on search
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTeacherQuery.toLowerCase())
  );
  const availableCourseTypes = COURSE_TYPE_OPTIONS[form.category] || [];

  const inputCls = 'admin-drawer-input';
  const textareaCls = 'admin-drawer-input min-h-28 resize-none';
  const labelCls = 'admin-drawer-label';
  const errorCls = 'mt-1.5 text-xs font-medium text-[var(--danger)]';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-drawer-title"
            className="admin-course-drawer fixed right-0 top-0 h-full w-full max-w-[560px] border-l z-[110] flex flex-col overflow-hidden"
          >
            {/* ── STICKY HEADER ── */}
            <div className="relative admin-drawer-header px-5 py-5 sm:px-8 sm:py-6 flex-shrink-0 flex items-center justify-between gap-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-md">
                  <MdBook size={24} />
                </div>
                <div>
                  <h2 id="course-drawer-title" className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {courseToEdit ? 'Edit Course Details' : 'Add New Course'}
                  </h2>
                  <p className="text-blue-100 text-xs mt-0.5">
                    {courseToEdit ? 'Update and refine course syllabus' : 'Create and publish a new learning course'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close course drawer"
                className="w-9 h-9 rounded-full bg-black/20 hover:bg-white/10 text-white flex items-center justify-center transition-all hover:rotate-90 duration-300 border border-white/10"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* ── SCROLLABLE FORM BODY ── */}
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7 space-y-7 custom-scrollbar relative z-10">
              
              {/* Animation Group Wrapper */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="space-y-7"
              >
                
                {/* ── SECTION 1: COURSE THUMBNAIL ── */}
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <label className={labelCls}>Course Thumbnail</label>
                  <label className="relative w-full h-44 rounded-xl border-2 border-dashed border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] flex flex-col items-center justify-center text-[var(--admin-text-secondary)] hover:text-[var(--accent)] transition-all duration-300 cursor-pointer group overflow-hidden">
                    {avatarPreview ? (
                      <div className="w-full h-full relative">
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <MdUploadFile size={32} className="text-white" />
                          <span className="text-xs text-white ml-2 font-semibold">
                            {isUploadingImage ? 'Uploading...' : 'Change Image'}
                          </span>
                        </div>
                        {isUploadingImage && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-[11px] font-semibold text-white">
                            Uploading course image...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <MdUploadFile size={36} className="text-purple-400/80 mb-2 group-hover:-translate-y-1.5 transition-transform duration-300" />
                        <span className="text-sm font-bold text-[var(--admin-text-primary)]">Upload course cover image</span>
                        <span className="text-[11px] text-[var(--admin-text-muted)] mt-1">Supports PNG, JPG, GIF, or WebP up to 5MB</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Upload course thumbnail" />
                  </label>
                  <div className="mt-2 flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-[var(--admin-text-muted)]">
                      Uploaded images are saved and reused as the course thumbnail.
                    </span>
                    {form.thumbnail && !isUploadingImage && (
                      <span className="font-semibold text-emerald-400">Image ready</span>
                    )}
                  </div>
                  {errors.thumbnail && <p className={errorCls}>{errors.thumbnail}</p>}
                </motion.div>

                {/* ── SECTION 2: BASIC INFORMATION ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-5"
                >
                  <h4 className="admin-drawer-section-title">
                    1. Basic Information
                  </h4>

                  {/* Course Name */}
                  <div>
                    <label className={labelCls}>Course Name *</label>
                    <div className="relative">
                      <MdTitle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={handleTitleChange}
                        aria-invalid={Boolean(errors.title)}
                        placeholder="e.g. Master Next.js and Server Actions"
                        className={`${inputCls} pl-11`}
                      />
                    </div>
                    {errors.title && <p className={errorCls}>{errors.title}</p>}
                  </div>

                  {/* Course Slug */}
                  <div>
                    <label className={labelCls}>Course Slug (Auto-Generated)</label>
                    <div className="relative">
                      <MdAssignment className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        readOnly
                        value={form.slug}
                        placeholder="e.g. master-nextjs-and-server-actions"
                        className="admin-drawer-input pl-11 opacity-70 cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className={labelCls}>Short Description *</label>
                    <div className="relative">
                      <MdDescription className="absolute left-3.5 top-5 text-gray-500" size={18} />
                      <textarea
                        required
                        value={form.shortDesc}
                        onChange={set('shortDesc')}
                        aria-invalid={Boolean(errors.shortDesc)}
                        placeholder="Brief overview summarizing the syllabus and core learning target (max 150 chars)."
                        maxLength={150}
                        className={`${textareaCls} pl-11 pt-4 h-20`}
                      />
                    </div>
                    {errors.shortDesc && <p className={errorCls}>{errors.shortDesc}</p>}
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className={labelCls}>Full Description</label>
                    <textarea
                      value={form.fullDesc}
                      onChange={set('fullDesc')}
                      placeholder="Comprehensive curriculum breakdown, pre-requisites, outcomes, and deep explanation of lessons."
                      className={textareaCls}
                    />
                  </div>
                </motion.div>

                {/* ── SECTION 3: COURSE DETAILS ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-5"
                >
                  <h4 className="admin-drawer-section-title">
                    2. Course Details
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Level */}
                    <div>
                      <label className={labelCls}>Course Level *</label>
                      <DropdownField
                        icon={MdLayers}
                        value={form.level}
                        options={LEVELS}
                        isOpen={activeDropdown === 'level'}
                        onToggle={() => setActiveDropdown(activeDropdown === 'level' ? null : 'level')}
                        onSelect={(value) => selectDropdownValue('level', value)}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className={labelCls}>Category *</label>
                      <DropdownField
                        icon={MdCategory}
                        value={form.category}
                        options={COURSE_CATEGORY_OPTIONS}
                        isOpen={activeDropdown === 'category'}
                        onToggle={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                        onSelect={(value) => selectDropdownValue('category', value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Course Type *</label>
                    <DropdownField
                      icon={MdBook}
                      value={form.courseType}
                      options={availableCourseTypes}
                      isOpen={activeDropdown === 'courseType'}
                      onToggle={() => setActiveDropdown(activeDropdown === 'courseType' ? null : 'courseType')}
                      onSelect={(value) => selectDropdownValue('courseType', value)}
                      placeholder="Select a course type"
                    />
                    <p className="mt-1.5 text-[11px] text-[var(--admin-text-muted)]">
                      Example: C, Python, and Java all belong to Programming Languages.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Duration */}
                    <div>
                      <label className={labelCls}>Duration (Hours)</label>
                      <div className="relative">
                        <MdTimer className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.duration}
                          onChange={set('duration')}
                          placeholder="e.g. 32"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className={labelCls}>Language</label>
                      <div className="relative">
                        <MdLanguage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          value={form.language}
                          onChange={set('language')}
                          placeholder="e.g. English"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── SECTION 4: TEACHER ASSIGNMENT ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-4"
                >
                  <h4 className="admin-drawer-section-title">
                    3. Teacher Assignment
                  </h4>

                  {/* Searchable Dropdown */}
                  <div>
                    <label className={labelCls}>Select Celebrity Teacher</label>
                    <div ref={teacherDropdownRef} className="relative">
                      <div className="relative">
                        <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          value={isTeacherDropdownOpen ? searchTeacherQuery : form.teacher}
                          onFocus={() => {
                            setSearchTeacherQuery('');
                            setIsTeacherDropdownOpen(true);
                          }}
                          onChange={(e) => {
                            setSearchTeacherQuery(e.target.value);
                            setIsTeacherDropdownOpen(true);
                          }}
                          placeholder="Search celebrity mentors..."
                          className={`${inputCls} pl-11 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                          aria-label="Search teachers"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]"
                        >
                          <MdSearch size={18} />
                        </button>
                      </div>

                      {/* Dropdown Options */}
                      <AnimatePresence>
                        {isTeacherDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto custom-scrollbar border bg-[var(--admin-surface-raised)] border-[var(--admin-border)]"
                          >
                            {filteredTeachers.length > 0 ? (
                              filteredTeachers.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, teacher: t.name }));
                                    setIsTeacherDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-3 text-xs text-[var(--admin-text-primary)] hover:bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] transition-all border-b border-[var(--admin-border-subtle)] flex items-center justify-between"
                                >
                                  <span>{t.name}</span>
                                  {form.teacher === t.name && <MdCheckCircle size={14} className="text-purple-400" />}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-xs text-[var(--admin-text-muted)] text-center">
                                No mentors match "{searchTeacherQuery}"
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* ── SECTION 5: PRICING ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-5"
                >
                  <h4 className="admin-drawer-section-title">
                    4. Pricing
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Price */}
                    <div>
                      <label className={labelCls}>Course Price (INR)</label>
                      <div className="relative">
                        <MdAttachMoney className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.price}
                          onChange={set('price')}
                          placeholder="e.g. 499"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>

                    {/* Discount Price */}
                    <div>
                      <label className={labelCls}>Discount Price (INR)</label>
                      <div className="relative">
                        <MdLocalOffer className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.discountPrice}
                          onChange={set('discountPrice')}
                          aria-invalid={Boolean(errors.discountPrice)}
                          placeholder="e.g. 299"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                      {errors.discountPrice && <p className={errorCls}>{errors.discountPrice}</p>}
                    </div>
                  </div>
                </motion.div>

                {/* ── SECTION 6: COURSE STATISTICS & STATUS ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-5"
                >
                  <h4 className="admin-drawer-section-title">
                    5. Statistics & Visibility
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Lessons */}
                    <div>
                      <label className={labelCls}>Total Lessons</label>
                      <div className="relative">
                        <MdSchool className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.lessons}
                          onChange={set('lessons')}
                          placeholder="e.g. 15"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>

                    {/* Projects */}
                    <div>
                      <label className={labelCls}>Total Projects</label>
                      <div className="relative">
                        <MdAssignment className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.projects}
                          onChange={set('projects')}
                          placeholder="e.g. 3"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Certificate available */}
                  <div className="admin-toggle-row">
                    <div>
                      <span className="text-sm font-bold text-[var(--admin-text-primary)] block">Certificate Available</span>
                      <span className="text-[10px] text-[var(--admin-text-muted)]">Provide verified completion certificate</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.certificate}
                        onChange={(e) => setForm(prev => ({ ...prev, certificate: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>

                  {/* Featured Course toggle */}
                  <div className="admin-toggle-row">
                    <div>
                      <span className="text-sm font-bold text-[var(--admin-text-primary)] block">Featured Course</span>
                      <span className="text-[10px] text-[var(--admin-text-muted)]">Display prominently on student dashboard homepage</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>

                  {/* Visibility Toggles */}
                  <div>
                    <label className={labelCls}>Visibility State</label>
                    <div className="flex gap-3">
                      {['Public', 'Private'].map(state => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, visibility: state }))}
                          className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                            form.visibility === state
                              ? 'bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] text-[var(--accent)]'
                              : 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Options */}
                  <div>
                    <label className={labelCls}>Publication Status</label>
                    <div className="flex gap-3">
                      {['Draft', 'Published', 'Archived'].map(state => {
                        const styleMap = {
                          Draft: 'bg-amber-500/15 border-amber-500/45 text-amber-500',
                          Published: 'bg-emerald-500/15 border-emerald-500/45 text-emerald-500',
                          Archived: 'bg-slate-500/15 border-slate-500/45 text-slate-400'
                        };
                        return (
                          <button
                            key={state}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, status: state }))}
                            className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                              form.status === state
                                ? styleMap[state]
                                : 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                            }`}
                          >
                            {state}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>

              </motion.div>
            </div>

            {/* ── STICKY FOOTER ACTIONS ── */}
            <div className="flex-shrink-0 px-5 py-4 sm:px-8 sm:py-5 border-t admin-drawer-footer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-20">
              <button
                type="button"
                onClick={onClose}
                className="admin-btn admin-btn-ghost w-full sm:w-auto"
              >
                Cancel
              </button>

              <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:flex-1 sm:justify-end">
                {/* Save Draft */}
                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  disabled={isUploadingImage}
                  className="admin-btn border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                >
                  Save Draft
                </button>

                {/* Publish */}
                <button
                  type="button"
                  onClick={() => handleSave('Published')}
                  disabled={isUploadingImage}
                  className="admin-btn admin-btn-primary"
                >
                  {isUploadingImage ? 'Uploading image...' : courseToEdit ? 'Publish Updates' : 'Publish Course'}
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CourseDrawer;
