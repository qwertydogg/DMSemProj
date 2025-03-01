CREATE DATABASE ContractorManagement;
USE ContractorManagement;

-- Clients Table
CREATE TABLE Clients (
    ClientID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Contact VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    Address TEXT
);

-- Contractors Table
CREATE TABLE Contractors (
    ContractorID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(100),
    Contact VARCHAR(50),
    Email VARCHAR(100) UNIQUE
);

-- Projects Table
CREATE TABLE Projects (
    ProjectID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    ClientID INT,
    ContractorID INT,
    StartDate DATE,
    EndDate DATE,
    Budget DECIMAL(12,2),
    Status ENUM('Planned', 'In Progress', 'Completed', 'On Hold') NOT NULL DEFAULT 'Planned',
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE,
    FOREIGN KEY (ContractorID) REFERENCES Contractors(ContractorID) ON DELETE CASCADE
);

-- Employees Table
CREATE TABLE Employees (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(100),
    HourlyRate DECIMAL(10,2),
    AssignedProjectID INT,
    FOREIGN KEY (AssignedProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE
);

-- Suppliers Table
CREATE TABLE Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Contact VARCHAR(50),
    MaterialType VARCHAR(255),
    Address TEXT
);

-- Materials Table
CREATE TABLE Materials (
    MaterialID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    SupplierID INT,
    UnitPrice DECIMAL(10,2),
    StockLevel INT,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID) ON DELETE CASCADE
);

-- Invoices Table
CREATE TABLE Invoices (
    InvoiceID INT AUTO_INCREMENT PRIMARY KEY,
    ProjectID INT,
    Amount DECIMAL(12,2),
    DueDate DATE,
    PaidStatus ENUM('Unpaid', 'Paid', 'Overdue') NOT NULL DEFAULT 'Unpaid',
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE
);

-- Timesheets Table
CREATE TABLE Timesheets (
    TimesheetID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT,
    ProjectID INT,
    Date DATE,
    HoursWorked DECIMAL(5,2),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID) ON DELETE CASCADE,
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE Messages (
    MessageID INT AUTO_INCREMENT PRIMARY KEY,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    ProjectID INT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    MessageContent TEXT,
    Status ENUM('Unread', 'Read') DEFAULT 'Unread',
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE
);

-- Documents Table
CREATE TABLE Documents (
    DocumentID INT AUTO_INCREMENT PRIMARY KEY,
    ProjectID INT,
    UploadedByID INT,
    FileName VARCHAR(255),
    FileType VARCHAR(50),
    UploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE
);
