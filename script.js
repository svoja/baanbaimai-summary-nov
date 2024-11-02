fetch("exData.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.time("Data Processing Time"); // Start timing

        const uniqueStudents = new Set();
        const studentData = [];
        const listElement = document.getElementById("list");

        const events = data.data.events; // Adjust based on your actual JSON structure
        events.forEach(event => {
            event.hours.forEach(hour => {
                hour.students.forEach(student => {
                    if (student.title && student.teacher_name) { // Assuming title is the student's name
                        if (!uniqueStudents.has(student.title)) {
                            uniqueStudents.add(student.title);
                            studentData.push({
                                title: student.title,
                                className: student.class_name || 'N/A',
                                teacherName: student.teacher_name,
                                timeSlot: hour.timeSlot
                            });
                        }
                    }
                });
            });
        });

        // Sort the studentData by title (name) in Thai alphabet order (ก-ฮ)
        studentData.sort((a, b) => a.title.localeCompare(b.title, 'th'));

        // Display the total number of unique students
        document.getElementById("studentQuantity").textContent = uniqueStudents.size;

        // Initialize pagination
        let currentPage = 1;
        const rowsPerPage = 10;
        let filteredStudents = studentData; // Store filtered student data

        // Function to display the current page of students
        function displayStudents(page) {
            listElement.innerHTML = ''; // Clear previous results
            const startIndex = (page - 1) * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            const currentStudents = filteredStudents.slice(startIndex, endIndex);

            currentStudents.forEach((student, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="text-center">${startIndex + index + 1}</td>
                    <td>${student.title}</td>
                    <td>${student.className}</td>
                    <td>${student.teacherName}</td>
                    <td>${student.timeSlot}</td>
                `;
                listElement.appendChild(row);
            });

            // Update pagination buttons
            updatePagination(page, Math.ceil(filteredStudents.length / rowsPerPage));
        }

        // Function to update pagination buttons
        function updatePagination(page, totalPages) {
            document.getElementById("prevPage").disabled = (page === 1);
            document.getElementById("nextPage").disabled = (page === totalPages);
            document.getElementById("firstPage").disabled = (page === 1);
            document.getElementById("lastPage").disabled = (page === totalPages);
        }

        // Pagination button event listeners
        document.getElementById("firstPage").addEventListener("click", () => {
            currentPage = 1;
            displayStudents(currentPage);
        });
        
        document.getElementById("prevPage").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                displayStudents(currentPage);
            }
        });
        
        document.getElementById("nextPage").addEventListener("click", () => {
            const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayStudents(currentPage);
            }
        });
        
        document.getElementById("lastPage").addEventListener("click", () => {
            currentPage = Math.ceil(filteredStudents.length / rowsPerPage);
            displayStudents(currentPage);
        });

        // Filter functionality
        const filterInput = document.getElementById("filterInput");
        const resultCountElement = document.getElementById("resultCount"); // Result count display

        filterInput.addEventListener("input", function() {
            const filterValue = filterInput.value.toLowerCase();
            filteredStudents = studentData.filter(student =>
                student.title.toLowerCase().includes(filterValue) ||
                student.className.toLowerCase().includes(filterValue) ||
                student.teacherName.toLowerCase().includes(filterValue) ||
                student.timeSlot.toLowerCase().includes(filterValue) // Add timeSlot filtering
            );

            // Update the result count as a badge
            resultCountElement.textContent = filteredStudents.length;

            // Reset to first page and display filtered results
            currentPage = 1;
            displayStudents(currentPage);
        });

        // Initial display
        displayStudents(currentPage);
        
        console.timeEnd("Data Processing Time"); // End timing and log the time taken
    })
    .catch(error => console.error("Error fetching JSON:", error));
