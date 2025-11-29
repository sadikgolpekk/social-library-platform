import React from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Container,
  useScrollTrigger,
  Slide,
  Avatar,
  Tooltip
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { 
  Brightness4, 
  Brightness7, 
  Search,
  PersonSearch,
  Person,
  Logout,
  MenuBook
} from "@mui/icons-material";
import { useKimlik } from "../baglam/KimlikBaglami";

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function UstMenu({ darkMode, toggleDarkMode }) {
  const { kullanici, cikisYap } = useKimlik();
  const navigate = useNavigate();

  const handleLogout = () => {
    cikisYap();
    navigate("/");
  };

  return (
    <HideOnScroll>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backdropFilter: "blur(20px)",
          backgroundColor: darkMode 
            ? "rgba(18, 18, 18, 0.85)" 
            : "rgba(25, 118, 210, 0.95)",
          borderBottom: darkMode 
            ? "1px solid rgba(255, 255, 255, 0.1)" 
            : "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 70 } }}>

            {/* LOGO / Akış */}
            <Typography
              variant="h5"
              component={Link}
              to="/akis"
              sx={{
                color: "inherit",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexGrow: 1,
                fontWeight: 700,
                letterSpacing: -0.5,
                fontSize: { xs: "1.1rem", sm: "1.4rem" },
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  opacity: 0.9,
                },
              }}
            >
              <MenuBook sx={{ fontSize: { xs: 28, sm: 32 } }} />
              Sosyal Kütüphane
            </Typography>

            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? "Aydınlık Tema" : "Karanlık Tema"} arrow>
              <IconButton
                onClick={toggleDarkMode}
                color="inherit"
                sx={{ 
                  mr: { xs: 0.5, sm: 2 },
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "rotate(180deg)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            {kullanici ? (
              <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1, md: 1.5 }}>

                {/* Kullanıcı Arama */}
                <Tooltip title="Kullanıcı Ara" arrow>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/kullanici-ara"
                    startIcon={<PersonSearch />}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        transform: "translateY(-2px)",
                      },
                      "& .MuiButton-startIcon": {
                        display: { xs: "none", sm: "flex" },
                      },
                    }}
                  >
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      Kullanıcı Ara
                    </Box>
                    <PersonSearch sx={{ display: { xs: "block", sm: "none" } }} />
                  </Button>
                </Tooltip>

                {/* Film/Kitap Arama */}
                <Tooltip title="Film/Kitap Ara" arrow>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/arama"
                    startIcon={<Search />}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        transform: "translateY(-2px)",
                      },
                      "& .MuiButton-startIcon": {
                        display: { xs: "none", sm: "flex" },
                      },
                    }}
                  >
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      Arama
                    </Box>
                    <Search sx={{ display: { xs: "block", sm: "none" } }} />
                  </Button>
                </Tooltip>

                {/* Profil */}
                <Tooltip title="Profilim" arrow>
                  <Button
                    color="inherit"
                    component={Link}
                    to={`/profil/${kullanici.id}`}
                    startIcon={
                      kullanici.avatar ? (
                        <Avatar 
                          src={kullanici.avatar} 
                          sx={{ width: 24, height: 24 }} 
                        />
                      ) : (
                        <Person />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        transform: "translateY(-2px)",
                      },
                      "& .MuiButton-startIcon": {
                        display: { xs: "none", sm: "flex" },
                      },
                    }}
                  >
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      Profil
                    </Box>
                    {!kullanici.avatar && (
                      <Person sx={{ display: { xs: "block", sm: "none" } }} />
                    )}
                    {kullanici.avatar && (
                      <Avatar 
                        src={kullanici.avatar} 
                        sx={{ 
                          width: 24, 
                          height: 24,
                          display: { xs: "block", sm: "none" }
                        }} 
                      />
                    )}
                  </Button>
                </Tooltip>

                {/* Çıkış */}
                <Tooltip title="Çıkış Yap" arrow>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    startIcon={<Logout />}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        transform: "translateY(-2px)",
                      },
                      "& .MuiButton-startIcon": {
                        display: { xs: "none", sm: "flex" },
                      },
                    }}
                  >
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      Çıkış
                    </Box>
                    <Logout sx={{ display: { xs: "block", sm: "none" } }} />
                  </Button>
                </Tooltip>
              </Box>
            ) : (
              <Box display="flex" gap={1}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/" 
                  sx={{ 
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2.5,
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Giriş
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/kayit" 
                  sx={{ 
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2.5,
                    fontWeight: 500,
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Kayıt Ol
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
}