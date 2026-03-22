import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

function DownArrow() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        py: 0.75,
        color: 'text.disabled',
      }}
      aria-hidden
    >
      <Box
        sx={{
          width: 2,
          height: 20,
          bgcolor: 'currentColor',
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            bottom: -2,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: (t) => `8px solid ${t.palette.text.disabled}`,
          },
        }}
      />
    </Box>
  );
}

function ClientBlock({ group }) {
  const { clientName, clientCode, synthetic, projects } = group;

  return (
    <PaperLike>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: projects.length ? 0 : 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BusinessRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} letterSpacing="-0.02em">
            {clientName}
          </Typography>
          {!synthetic && clientCode && (
            <Typography variant="caption" color="text.secondary">
              {clientCode}
            </Typography>
          )}
        </Box>
      </Stack>

      {projects.length === 0 ? (
        <>
          <DownArrow />
          <Typography variant="body2" color="text.secondary" sx={{ pl: 6.5 }}>
            {synthetic
              ? "You're not on any projects yet, or none are visible with your access."
              : 'No projects for this client yet.'}
          </Typography>
        </>
      ) : (
        projects.map((proj) => (
          <Box key={proj.projectId}>
            <DownArrow />
            <ProjectBlock project={proj} />
          </Box>
        ))
      )}
    </PaperLike>
  );
}

function ProjectBlock({ project }) {
  const { name, key, employees } = project;
  return (
    <Box sx={{ pl: { xs: 1, sm: 3 }, borderLeft: 2, borderColor: 'divider', ml: 2.5 }}>
      <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
          }}
        >
          <FolderRoundedIcon fontSize="small" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {key}
          </Typography>
        </Box>
      </Stack>

      <DownArrow />
      <Box sx={{ pl: 5.5, pt: 0.5 }}>
        {employees.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No members assigned.
          </Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center">
            <PersonRoundedIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.25 }} />
            {employees.map((nameStr, idx) => (
              <Chip key={`${project.projectId}-m-${idx}`} size="small" label={nameStr} variant="outlined" />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function PaperLike({ children }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        mb: 3,
        '&:last-of-type': { mb: 0 },
      }}
    >
      {children}
    </Box>
  );
}

export default function ClientProjectEmployeeTree({ tree }) {
  if (!tree || tree.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No clients yet. Add a client and projects to see the hierarchy.
      </Typography>
    );
  }

  return (
    <Box>
      {tree.map((group) => (
        <ClientBlock key={group.clientId || group.clientName} group={group} />
      ))}
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
        Showing up to 100 clients and 200 projects. Names for members resolve when you can access the users list
        (managers); otherwise you may see &quot;Team member&quot;.
      </Typography>
    </Box>
  );
}
