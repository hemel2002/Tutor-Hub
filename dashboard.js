/* globals Chart:false */

(() => {
  'use strict'
  // Ensure the DOM is loaded
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
if (!isBrowser) {
  return;
}
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', (event) => {
        // Initialize all toasts in the container
        const toastElements = document.querySelectorAll('.toast');
        
        toastElements.forEach((toastElement) => {
            // Initialize the Bootstrap Toast instance
            const toast = new bootstrap.Toast(toastElement, {
              delay: 5000 // Set delay to 5000ms (5 seconds)
          });
           // Show the toast
      toast.show();  
       // Add event listener to adjust stacking
       toastElement.addEventListener('shown.bs.toast', () => {
        adjustToastPosition();
    });

    toastElement.addEventListener('hidden.bs.toast', () => {
        adjustToastPosition();
    });
    });
});


   

     
  

  // Function to adjust the stacking position of toasts
  function adjustToastPosition() {
      const visibleToasts = Array.from(document.querySelectorAll('.toast.show'));
      let offset = 0;

      visibleToasts.forEach((toast) => {
          toast.style.marginTop = `${offset}px`;
          offset += 1; // Adjust the spacing between toasts
      });
  }
};

  const toastElList = document.querySelectorAll('.toast')
const toastList = [...toastElList].map(toastEl => new bootstrap.Toast(toastEl, option))
const input = document.getElementById('itemInput');
        const list = document.getElementById('dynamicList');
        const emptyMessage = document.querySelector('.empty-message');

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addItem();
            }
        });

        function addItem() {
            const text = input.value.trim();
            
            if (text === '') {
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
                return;
            }

            // Remove empty message if it's the first item
            if (list.contains(emptyMessage)) {
                list.removeChild(emptyMessage);
            }

            const li = document.createElement('li');
            li.className = 'list-item';
            
            const span = document.createElement('span');
            span.textContent = text;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.setAttribute('aria-label', 'Delete item');
            
            deleteBtn.onclick = function() {
                li.style.opacity = '0';
                li.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    list.removeChild(li);
                    if (list.children.length === 0) {
                        list.appendChild(emptyMessage);
                    }
                }, 300);
            };

            li.appendChild(span);
            li.appendChild(deleteBtn);
            list.appendChild(li);
            
            input.value = '';
        }

})()
