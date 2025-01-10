const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar(year, month) {
  calendar.innerHTML = `
    <div class="day" onclick="selectByDay(0)">Sun</div>
    <div class="day" onclick="selectByDay(1)">Mon</div>
    <div class="day" onclick="selectByDay(2)">Tue</div>
    <div class="day" onclick="selectByDay(3)">Wed</div>
    <div class="day" onclick="selectByDay(4)">Thu</div>
    <div class="day" onclick="selectByDay(5)">Fri</div>
    <div class="day" onclick="selectByDay(6)">Sat</div>
  `;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty slots for days before the first day
  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += '<div></div>';
  }

  // Add days with checkboxes
  for (let day = 1; day <= daysInMonth; day++) {
    calendar.innerHTML += `
      <div class="date">
        ${day}
        <input type="checkbox" data-day="${new Date(year, month, day).getDay()}" />
      </div>
    `;
  }

  monthYear.textContent = `${new Date(year, month).toLocaleString('default', {
    month: 'long'
  })} ${year}`;
}

  // Function to select all checkboxes of a particular day (Sunday, Monday, etc.)
function selectByDay(dayIndex) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (parseInt(checkbox.dataset.day) === dayIndex) {
        checkbox.checked = true;  // Check the checkboxes of the selected day
      }
    });
  }
  
  // Attach the selectByDay function to each header day when it's clicked
  const headerDays = document.querySelectorAll('.calendar-header .day');
  headerDays.forEach((day, index) => {
    day.addEventListener('click', () => {
      selectByDay(index);  // Trigger selecting by day on click
    });
  });
  
  // Attach event listeners to the buttons that select each day
  const dayButtons = document.querySelectorAll('.select-buttons button');
  dayButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      selectByDay(index);
    });
  });
  
  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth <0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
}
);
nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  
  renderCalendar(currentYear, currentMonth);
});

renderCalendar(currentYear, currentMonth);