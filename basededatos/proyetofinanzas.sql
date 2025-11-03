create database proyectofinanzas

create table Usuarios(
    UsuarioId INT primary key AUTO_INCREMENT,   
    NombreCompleto VARCHAR(100) not null,
    Correo VARCHAR(100) not null unique, 
    Contraseña VARCHAR(255) not null,
    FechaRegistro DATE not null,
    NumeroTelefonico VARCHAR(20) null  
)
create table TipoMovimiento(
    Id INT primary key AUTO_INCREMENT,
    Nombre VARCHAR(50) not null
)
create table Movimientos(
    Id INT primary key AUTO_INCREMENT,
    Gasto INT not null,
    Fecha DATE not null,
    Nombre VARCHAR(50) not null, 
    fkusuarios INT not null,
    tipogasto INT NOT null,
    FOREIGN KEY (tipogasto) REFERENCES TipoMovimiento(Id),
    FOREIGN KEY (fkusuarios) REFERENCES Usuarios(UsuarioId)
)
create table metasfinancieras(
     Id INT primary key AUTO_INCREMENT,
     Nombre VARCHAR(200) not null,
     costoobjeto INT not null,
     MontoAgregar INT not null,
     fkusuarios INT not null,
     FOREIGN KEY (fkusuarios) REFERENCES Usuarios(UsuarioId)
)