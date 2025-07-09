<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/Snowcone-Labs.png',
    name: 'Snowcone Labs',
    title: "Organization",
    links: [
      { icon: 'github', link: 'https://github.com/Snowcone-Labs' },
      { icon: 'website', link: 'https://snowflake.blue' },
    ]
  },
]
</script>

<style>
/* SVG of the external link icon */
.vpi-social-website {
  --icon: url("data:image/svg+xml,%3Csvg%20stroke=%22currentColor%22%20fill=%22none%22%20stroke-width=%222%22%20viewBox=%220%200%2024%2024%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20height=%22200px%22%20width=%22200px%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22M18%2013v6a2%202%200%200%201-2%202H5a2%202%200%200%201-2-2V8a2%202%200%200%201%202-2h6%22%3E%3C/path%3E%3Cpolyline%20points=%2215%203%2021%203%2021%209%22%3E%3C/polyline%3E%3Cline%20x1=%2210%22%20y1=%2214%22%20x2=%2221%22%20y2=%223%22%3E%3C/line%3E%3C/svg%3E");
}
</style>

# Maintainers

Permafrost is maintained by these amazing people:

<VPTeamMembers size="small" :members="members" />
