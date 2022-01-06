export const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};


export const getCourseTerm = course => (
    terms[course.id.charAt(0)]
);
  
export  const getCourseNumber = course => (
    course.id.slice(1, 4)
);

export const hasConflict = (course, selected) => (
  selected.some(selection => courseConflict(course, selection))
); // tells us when a course conflicts with a set of selected courses

const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;

export const timeParts = meets => {
  const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];
  return !match ? {} : {
    days,
    hours: {
      start: hh1 * 60 + mm1 * 1, // converted into minutes from midnight
      end: hh2 * 60 + mm2 * 1
    }
  };
}; // regex to parse days and times from the schedules 

const mapValues = (fn, obj) => (
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)]))
); // adding the parsed fields to each course when we first fetch them so we won't constantly have to re-parse

const addCourseTimes = course => ({
  ...course,
  ...timeParts(course.meets)
});

export const addScheduleTimes = schedule => ({
  title: schedule.title,
  courses: mapValues(addCourseTimes, schedule.courses)
});

const days = ['M', 'Tu', 'W', 'Th', 'F'];

const daysOverlap = (days1, days2) => ( 
  days.some(day => days1.includes(day) && days2.includes(day))
); // are there overlapping days?

const hoursOverlap = (hours1, hours2) => (
  Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end)
); // are there overlapping hours?

const timeConflict = (course1, course2) => (
  daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
); // if the days and hours overlap, this is a time conflict

const courseConflict = (course1, course2) => (
  getCourseTerm(course1) === getCourseTerm(course2)
  && timeConflict(course1, course2)
); // if the course term is the same and there is a time conflict, there is a course conflict