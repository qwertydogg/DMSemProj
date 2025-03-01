-- Clients Data
INSERT INTO Clients (Name, Contact, Email, Address) VALUES 
('Alice Johnson', '555-1234', 'alice.johnson@email.com', '123 Maple Street, Springfield'),
('Bob Smith', '555-5678', 'bob.smith@email.com', '456 Oak Avenue, Springfield'),
('Catherine Lee', '555-8765', 'catherine.lee@email.com', '789 Pine Road, Springfield');

-- Contractors Data
INSERT INTO Contractors (Name, Role, Contact, Email) VALUES 
('Mark Weiss', 'General Contractor', '555-1122', 'mark.weiss@email.com'),
('Connor Nystrom', 'Contractor', '555-3344', 'connor.nystrom@email.com'),
('Dr. Poudel', 'Roofing Specialist', '555-5566', 'dr.poudel@email.com');

-- Projects Data
INSERT INTO Projects (Name, ClientID, ContractorID, StartDate, EndDate, Budget, Status) VALUES 
('Kitchen Renovation', 1, 1, '2025-03-01', '2025-05-01', 15000.00, 'Ongoing'),
('Gutter Restoration', 2, 1, '2025-04-01', '2025-06-01', 8000.00, 'Planned'),
('Retaining Wall Installation', 3, 2, '2025-03-15', '2025-04-30', 12000.00, 'Ongoing'),
('Roofing Repair', 1, 3, '2025-03-20', '2025-04-15', 5000.00, 'Planned');

-- Employees Data
INSERT INTO Employees (Name, Role, HourlyRate, AssignedProjectID) VALUES 
('John Doe', 'Laborer', 25.00, 1),
('Jane Smith', 'Laborer', 22.00, 3),
('Robert White', 'Laborer', 20.00, 2),
('Samantha Brown', 'Project Manager', 35.00, 4);

-- Suppliers Data
INSERT INTO Suppliers (Name, Contact, MaterialType, Address) VALUES 
('Home Depot', '555-7788', 'Building Materials', '123 Market Street, Springfield'),
('Lowe\'s', '555-9900', 'Roofing Materials', '456 Industrial Park, Springfield'),
('Ace Hardware', '555-3344', 'Tools', '789 Commerce Blvd, Springfield');

-- Materials Data
INSERT INTO Materials (Name, SupplierID, UnitPrice, StockLevel) VALUES 
('Wood', 1, 50.00, 200),
('Shingles', 2, 3.00, 500),
('Concrete', 1, 75.00, 150),
('Nails', 3, 0.10, 1000);

-- Invoices Data
INSERT INTO Invoices (ProjectID, Amount, DueDate, PaidStatus) VALUES 
(1, 15000.00, '2025-05-01', 'Unpaid'),
(2, 8000.00, '2025-06-01', 'Unpaid'),
(3, 12000.00, '2025-05-01', 'Unpaid'),
(4, 5000.00, '2025-04-15', 'Unpaid');

-- Timesheets Data
INSERT INTO Timesheets (EmployeeID, ProjectID, Date, HoursWorked) VALUES 
(1, 1, '2025-03-01', 8),
(2, 3, '2025-03-15', 8),
(3, 2, '2025-04-01', 8),
(4, 4, '2025-03-20', 8);

-- Messages Data
INSERT INTO Messages (SenderID, ReceiverID, ProjectID, MessageContent, Status) VALUES 
(1, 2, 1, 'Please confirm the start date for the kitchen renovation project.', 'Unread'),
(2, 3, 3, 'Can you send over the designs for the retaining wall installation?', 'Unread'),
(3, 1, 4, 'We need additional materials for the roofing repair project.', 'Unread');

-- Documents Data
INSERT INTO Documents (ProjectID, UploadedByID, FileName, FileType) VALUES 
(1, 1, 'kitchen_renovation_plan.pdf', 'pdf'),
(2, 1, 'gutter_restoration_plan.pdf', 'pdf'),
(3, 2, 'retaining_wall_design.jpg', 'jpg'),
(4, 3, 'roofing_repair_estimate.pdf', 'pdf');
