const { prisma, connectDB } = require('./src/config/db');

// A mapping of keywords to high-quality, relevant, static Unsplash images.
const THUMBNAILS = {
  "python": "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80",
  "javascript": "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80",
  "css": "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80",
  "ai": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  "machine learning": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  "data science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80"
};

function getThumbnailForCourse(title, category) {
  const text = `${title} ${category}`.toLowerCase();
  
  if (text.includes('python')) return THUMBNAILS['python'];
  if (text.includes('javascript') || text.includes('js')) return THUMBNAILS['javascript'];
  if (text.includes('css')) return THUMBNAILS['css'];
  if (text.includes('ai') || text.includes('machine learning')) return THUMBNAILS['ai'];
  if (text.includes('data')) return THUMBNAILS['data science'];
  
  return THUMBNAILS['default'];
}

async function main() {
  await connectDB();
  const courses = await prisma.course.findMany({
    select: { id: true, title: true, category: true }
  });

  for (const course of courses) {
    const thumbnail = getThumbnailForCourse(course.title, course.category);

    await prisma.course.update({
      where: { id: course.id },
      data: { thumbnail }
    });
    console.log(`Updated thumbnail for: ${course.title} -> ${thumbnail}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
