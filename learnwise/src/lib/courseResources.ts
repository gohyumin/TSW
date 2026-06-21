// Real course resources (Actual PDFs and actual YouTube embeds)
export interface CourseResource {
  pdfUrl: string;
  videoId: string;
}

export const courseResources: Record<number, CourseResource> = {
  1: { // Complete Web Development Bootcamp
    pdfUrl: "https://www.london.ac.uk/sites/default/files/programme-specifications/programme-specification-bsc-computer-science-2024-2025.pdf",
    videoId: "G3e-cpL7ofc"
  },
  2: { // Machine Learning with Python
    pdfUrl: "https://web.stanford.edu/class/cs229/syllabus.pdf",
    videoId: "GwIo3gqyRIQ"
  },
  3: { // Introduction to Python Programming
    pdfUrl: "https://docs.python.org/3/pdf/tutorial.pdf",
    videoId: "_uQrJ0TkZlc"
  },
  4: { // UI/UX Design Masterclass
    pdfUrl: "https://www.cs.tufts.edu/comp/171/syllabus.pdf",
    videoId: "kbZkpFqBy6M"
  },
  5: { // Data Analysis with SQL & Pandas
    pdfUrl: "https://pandas.pydata.org/pandas-docs/stable/pandas.pdf",
    videoId: "ZyhVh-qRZPA"
  },
  6: { // Deep Learning and Computer Vision
    pdfUrl: "https://web.stanford.edu/class/cs230/syllabus.pdf",
    videoId: "V_xro1bcAuA"
  },
  7: { // Cybersecurity Fundamentals
    pdfUrl: "https://www.cs.bu.edu/fac/goldbe/teaching/CS558S15/CS558syllabus.pdf",
    videoId: "3Kq1MIfTWCE"
  },
  8: { // Advanced React Patterns
    pdfUrl: "https://web.stanford.edu/class/cs142/lectures/JavaScript.pdf",
    videoId: "bMknfKXIFA8"
  },
  9: { // Big Data Engineering with Spark
    pdfUrl: "https://web.stanford.edu/class/cs246/handouts/cs246-syllabus.pdf",
    videoId: "_C8kWMA4xqY"
  },
  10: { // Ethical Hacking & Penetration Testing
    pdfUrl: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf",
    videoId: "Oru83da-T0U"
  },
  11: { // Natural Language Processing (NLP)
    pdfUrl: "https://web.stanford.edu/class/cs224n/handouts/cs224n-syllabus.pdf",
    videoId: "8y-3F1T64u0"
  },
  12: { // Product Design and UX Strategy
    pdfUrl: "https://www.hcii.cmu.edu/sites/default/files/05-410-05-610_syllabus_0.pdf",
    videoId: "5cx6G1W4tT4"
  },
  13: { // Node.js API Development
    pdfUrl: "https://web.stanford.edu/class/cs142/lectures/JavaScript.pdf",
    videoId: "f2EqECiUXac"
  },
  14: { // Generative AI & LLM Engineering
    pdfUrl: "https://web.stanford.edu/class/cs324/syllabus.pdf",
    videoId: "kCc8FmEb1nY"
  },
  15: { // Data Visualization with Tableau
    pdfUrl: "https://www.cs.ubc.ca/~tmm/courses/533D-09/syllabus.pdf",
    videoId: "aHeAl12CX1o"
  }
};

export const getResourcesForCourse = (courseId: number): CourseResource => {
  return courseResources[courseId] || {
    pdfUrl: "https://www.london.ac.uk/sites/default/files/programme-specifications/programme-specification-bsc-computer-science-2024-2025.pdf",
    videoId: "G3e-cpL7ofc"
  };
};
