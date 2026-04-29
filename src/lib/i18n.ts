export type Lang = "en" | "es";

export const translations = {
  en: {
    // Nav
    stacks: "Stacks",
    cli: "CLI",
    docs: "Docs",
    signIn: "Sign in",
    signOut: "Sign out",
    submit: "Submit",
    library: "My Library",
    teams: "Teams",
    admin: "Admin",
    settings: "Settings",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Language",

    // Home hero
    heroTitle: "Your MCP stack for Claude Code, Codex & Copilot",
    heroDesc: "Discover, save, and install MCP servers, skills, and agents for Claude Code, Codex, OpenCode, GitHub Copilot, and Cursor. One command to set it all up.",
    heroOr: "or",
    allCommands: "All commands →",

    // Sort tabs
    sortFeatured: "Featured",
    sortPopular: "Popular",
    sortTrending: "Trending",
    sortHot: "Hot today",
    sortNew: "New",

    // Home sections
    sectionMcps: "MCP Servers",
    sectionSkills: "Skills",
    sectionAgents: "Agents",
    featured: "Featured",
    allServers: "All servers",
    allSkills: "All skills",
    allAgents: "All agents",
    results: "results",
    noServers: "No servers found.",
    noSkills: "No skills found.",
    noAgents: "No agents found.",
    submitOne: "Submit one!",

    // MCP section banner
    mcpBannerTitle: "MCP Servers",
    mcpBannerDesc: "connect Claude to external tools and data sources. Run",
    mcpBannerDesc2: "to add any server instantly.",
    submitServer: "Submit a server →",

    // Skills banner
    skillsBannerTitle: "Skills",
    skillsBannerDesc: "install as",
    skillsBannerDesc2: "in Claude Code. Run",
    skillsBannerDesc3: "and type",
    skillsBannerDesc4: "in any conversation.",
    submitSkill: "Submit a skill →",

    // Agents banner
    agentsBannerTitle: "Agents",
    agentsBannerDesc: "have a persistent system prompt and behavior. Run",
    agentsBannerDesc2: "then",
    submitAgent: "Submit an agent →",

    // Cards
    installs: "installs",
    verified: "Verified",
    install: "Install",
    copied: "Copied!",
    copyInstall: "Copy install command",

    // Stacks list
    stacksTitle: "Stacks",
    stacksDesc: "Give your team a shared AI setup in minutes — the same servers, skills, and agents, one install command. No more \"what tools are you using?\"",
    myStacks: "My stacks",
    curatedStacks: "Curated",
    communityStacks: "Community",
    createStack: "+ Create stack",
    installStack: "Install entire stack",
    servers: "servers",
    skills_label: "skills",
    agents_label: "agents",
    stacksCuratedBadge: "Curated & community stacks",
    stacksCreateCta: "Build your team's stack",
    stacksCreateDesc: "Combine servers, skills, and agents into a shared setup your whole team can install with one command.",
    stacksSignIn: "Sign in to create →",

    // Stack detail
    allStacksBack: "← All stacks",
    installStackDesc1: "Installs all",
    installStackDesc2: "items — servers, skills, and agents — in one command.",
    noItemsStack: "No items found yet for this stack.",
    shareStackTitle: "Share this stack",
    shareStackDesc: "Copy the install command and share it — anyone can set up the same environment in seconds.",
    createTeam: "Create team →",

    // Submit
    submitTitle: "Submit to Codestack",
    submitDesc: "Share an MCP server, a skill, or an AI agent with the community — or save it privately to your library.",

    // Library
    libraryTitle: "My Library",
    libraryDesc: "Everything you've submitted — MCP servers, skills, and agents.",
    totalItems: "Total items",
    published: "Published",
    private: "Private",
    addNew: "+ Add new",
    libraryEmpty: "Your library is empty",
    libraryEmptyDesc: "Submit MCP servers, skills, or agents — public or private.",
    newServer: "+ New server",
    newSkill: "+ New skill",
    newAgent: "+ New agent",
    submitMcpServer: "+ Submit MCP Server",

    // Server detail
    backToMcpHub: "← Back to Codestack",
    verifiedBadge: "✓ Verified",
    featuredBadge: "★ Featured",
    installWithCli: "Install with Codestack CLI",
    installAutoDesc: "Automatically installs and configures in Claude Code, GitHub Copilot, Codex, and Cursor.",
    getCli: "Get Codestack CLI →",
    manualInstall: "Manual Install",
    requiredEnvVars: "Required Environment Variables",
    required: "required",
    mcpTools: "MCP Tools",
    about: "About",
    viewOnGitHub: "View on GitHub",
    transport: "Transport",
    compatibleWith: "Compatible with",
    tags: "Tags",

    // Skill detail
    allSkillsBack: "← All skills",
    whatHappensInstall: "What happens when you install it",
    skillStep1Title: "You run the install command",
    skillStep1Desc: "Codestack CLI downloads this prompt from the registry.",
    skillStep2Title: "Saved as a file in Claude Code",
    skillStep2Desc: "Claude Code reads all .md files in this folder as slash commands.",
    skillStep3Title: "Use it in any conversation",
    skillStep3Desc: "Claude runs the prompt against your current file or selection — no copy-paste needed.",
    skillStep3Sub: "in Claude Code (after restart)",
    promptContent: "Content",
    afterInstallRestart: "After install, restart Claude Code and type:",
    requiresCli: "Requires",
    lookingForAgents: "Looking for Agents?",
    lookingForAgentsDesc: "Agents run with a full system prompt and persistent behavior — not just a one-off command.",
    browseAgents: "Browse agents →",
    shareWithTeam: "Share with your team",
    shareSkillTeamDesc: "Add this skill to your team so everyone gets it on mcp sync.",

    // Agent detail
    allAgentsBack: "← All agents",
    agentStep1Title: "Install the agent",
    agentStep1Desc: "Downloads the system prompt and saves it locally.",
    agentStep2Title: "Saved as an agent definition",
    agentStep2Desc: "This file contains the system prompt that defines how this agent thinks and behaves.",
    agentStep3Title: "Run it for any task",
    agentStep3Desc: "The agent maintains its persona and principles throughout the entire session.",
    thenRunWith: "Then run with:",
    systemPrompt: "System prompt",
    agentVsSkillTitle: "Agent vs Skill — what's the difference?",
    skillTypeLabel: "Skill (prompt)",
    skillTypeDesc: "One-off task. You call it, it runs, done. Great for repetitive actions like reviewing a PR or writing tests.",
    agentTypeLabel: "Agent",
    agentTypeDesc: "Persistent persona. Every message is answered through this agent's expertise and principles. Great for extended sessions.",
    lookingForSkills: "Looking for Slash commands?",
    lookingForSkillsDesc: "Skills are one-off prompts you invoke with /command.",
    browseSkills: "Browse skills →",
    shareAgentTeamDesc: "Add this agent to your team so everyone gets it on mcp sync.",
    author: "Author",
    installSidebar: "Install",

    // Footer
    footer: "Codestack — Open source. Built for the MCP community.",

    // Common
    by: "by",
    searchPlaceholder: "Search...",
    searchMcps: "Search MCP servers...",
    searchSkills: "Search skills...",
    searchAgents: "Search agents...",
    viewAll: "View all →",
  },
  es: {
    // Nav
    stacks: "Stacks",
    cli: "CLI",
    docs: "Docs",
    signIn: "Entrar",
    signOut: "Cerrar sesión",
    submit: "Publicar",
    library: "Mi Biblioteca",
    teams: "Equipos",
    admin: "Admin",
    settings: "Ajustes",
    theme: "Tema",
    dark: "Oscuro",
    light: "Claro",
    language: "Idioma",

    // Home hero
    heroTitle: "Tu stack de MCPs para Claude Code, Codex y Copilot",
    heroDesc: "Descubre, guarda e instala MCP servers, skills y agentes para Claude Code, Codex, OpenCode, GitHub Copilot y Cursor. Un comando para configurarlo todo.",
    heroOr: "o",
    allCommands: "Todos los comandos →",

    // Sort tabs
    sortFeatured: "Destacados",
    sortPopular: "Popular",
    sortTrending: "Trending",
    sortHot: "Hoy",
    sortNew: "Nuevo",

    // Home sections
    sectionMcps: "Servidores MCP",
    sectionSkills: "Skills",
    sectionAgents: "Agentes",
    featured: "Destacados",
    allServers: "Todos los servidores",
    allSkills: "Todos las skills",
    allAgents: "Todos los agentes",
    results: "resultados",
    noServers: "No se encontraron servidores.",
    noSkills: "No se encontraron skills.",
    noAgents: "No se encontraron agentes.",
    submitOne: "¡Envía uno!",

    // MCP section banner
    mcpBannerTitle: "Servidores MCP",
    mcpBannerDesc: "conectan Claude a herramientas y fuentes de datos externas. Ejecuta",
    mcpBannerDesc2: "para añadir cualquier servidor al instante.",
    submitServer: "Enviar servidor →",

    // Skills banner
    skillsBannerTitle: "Skills",
    skillsBannerDesc: "se instalan como",
    skillsBannerDesc2: "en Claude Code. Ejecuta",
    skillsBannerDesc3: "y escribe",
    skillsBannerDesc4: "en cualquier conversación.",
    submitSkill: "Enviar skill →",

    // Agents banner
    agentsBannerTitle: "Agentes",
    agentsBannerDesc: "tienen un system prompt persistente. Ejecuta",
    agentsBannerDesc2: "luego",
    submitAgent: "Enviar agente →",

    // Cards
    installs: "instalaciones",
    verified: "Verificado",
    install: "Instalar",
    copied: "¡Copiado!",
    copyInstall: "Copiar comando de instalación",

    // Stacks list
    stacksTitle: "Stacks",
    stacksDesc: "Dale a tu equipo el mismo entorno de IA en minutos — los mismos servidores, skills y agentes, con un solo comando. Sin el \"¿qué herramientas usas tú?\"",
    myStacks: "Mis stacks",
    curatedStacks: "Curados",
    communityStacks: "Comunidad",
    createStack: "+ Crear stack",
    installStack: "Instalar stack completo",
    servers: "servidores",
    skills_label: "skills",
    agents_label: "agentes",
    stacksCuratedBadge: "Stacks curados y de comunidad",
    stacksCreateCta: "Crea el stack de tu equipo",
    stacksCreateDesc: "Combina servidores, skills y agentes en un entorno compartido que todo tu equipo puede instalar con un comando.",
    stacksSignIn: "Entra para crear →",

    // Stack detail
    allStacksBack: "← Todos los stacks",
    installStackDesc1: "Instala los",
    installStackDesc2: "elementos — servidores, skills y agentes — en un solo comando.",
    noItemsStack: "Este stack aún no tiene elementos.",
    shareStackTitle: "Comparte este stack",
    shareStackDesc: "Copia el comando de instalación y compártelo — cualquiera puede tener el mismo entorno en segundos.",
    createTeam: "Crear equipo →",

    // Submit
    submitTitle: "Publicar en Codestack",
    submitDesc: "Comparte un servidor MCP, una skill o un agente con la comunidad — o guárdalo de forma privada en tu biblioteca.",

    // Library
    libraryTitle: "Mi Biblioteca",
    libraryDesc: "Todo lo que has enviado — servidores MCP, skills y agentes.",
    totalItems: "Total",
    published: "Publicados",
    private: "Privados",
    addNew: "+ Añadir",
    libraryEmpty: "Tu biblioteca está vacía",
    libraryEmptyDesc: "Publica servidores MCP, skills o agentes — públicos o privados.",
    newServer: "+ Nuevo servidor",
    newSkill: "+ Nueva skill",
    newAgent: "+ Nuevo agente",
    submitMcpServer: "+ Publicar servidor MCP",

    // Server detail
    backToMcpHub: "← Volver a Codestack",
    verifiedBadge: "✓ Verificado",
    featuredBadge: "★ Destacado",
    installWithCli: "Instalar con Codestack CLI",
    installAutoDesc: "Instala y configura automáticamente en Claude Code, GitHub Copilot, Codex y Cursor.",
    getCli: "Obtener Codestack CLI →",
    manualInstall: "Instalación manual",
    requiredEnvVars: "Variables de entorno requeridas",
    required: "requerida",
    mcpTools: "Herramientas MCP",
    about: "Acerca de",
    viewOnGitHub: "Ver en GitHub",
    transport: "Transporte",
    compatibleWith: "Compatible con",
    tags: "Etiquetas",

    // Skill detail
    allSkillsBack: "← Todas las skills",
    whatHappensInstall: "Qué ocurre al instalarla",
    skillStep1Title: "Ejecutas el comando de instalación",
    skillStep1Desc: "Codestack CLI descarga este prompt del registro.",
    skillStep2Title: "Se guarda como archivo en Claude Code",
    skillStep2Desc: "Claude Code lee todos los archivos .md de esta carpeta como slash commands.",
    skillStep3Title: "Úsalo en cualquier conversación",
    skillStep3Desc: "Claude ejecuta el prompt sobre tu archivo o selección actual — sin copiar y pegar.",
    skillStep3Sub: "en Claude Code (tras reiniciar)",
    promptContent: "Contenido",
    afterInstallRestart: "Tras instalar, reinicia Claude Code y escribe:",
    requiresCli: "Requiere",
    lookingForAgents: "¿Buscas Agentes?",
    lookingForAgentsDesc: "Los agentes tienen un system prompt persistente — no son un comando puntual.",
    browseAgents: "Ver agentes →",
    shareWithTeam: "Comparte con tu equipo",
    shareSkillTeamDesc: "Añade esta skill a tu equipo para que todos la reciban con mcp sync.",

    // Agent detail
    allAgentsBack: "← Todos los agentes",
    agentStep1Title: "Instala el agente",
    agentStep1Desc: "Descarga el system prompt y lo guarda localmente.",
    agentStep2Title: "Guardado como definición de agente",
    agentStep2Desc: "Este archivo contiene el system prompt que define cómo piensa y actúa el agente.",
    agentStep3Title: "Ejecútalo para cualquier tarea",
    agentStep3Desc: "El agente mantiene su persona y principios durante toda la sesión.",
    thenRunWith: "Luego ejecútalo con:",
    systemPrompt: "System prompt",
    agentVsSkillTitle: "Agente vs Skill — ¿cuál es la diferencia?",
    skillTypeLabel: "Skill (prompt)",
    skillTypeDesc: "Tarea puntual. Lo invocas, se ejecuta, listo. Ideal para acciones repetitivas como revisar un PR o escribir tests.",
    agentTypeLabel: "Agente",
    agentTypeDesc: "Persona persistente. Cada mensaje se responde desde la experiencia y principios del agente. Ideal para sesiones largas.",
    lookingForSkills: "¿Buscas Slash commands?",
    lookingForSkillsDesc: "Las skills son prompts puntuales que invocas con /comando.",
    browseSkills: "Ver skills →",
    shareAgentTeamDesc: "Añade este agente a tu equipo para que todos lo reciban con mcp sync.",
    author: "Autor",
    installSidebar: "Instalar",

    // Footer
    footer: "Codestack — Código abierto. Construido para la comunidad MCP.",

    // Common
    by: "por",
    searchPlaceholder: "Buscar...",
    searchMcps: "Buscar servidores MCP...",
    searchSkills: "Buscar skills...",
    searchAgents: "Buscar agentes...",
    viewAll: "Ver todos →",
  },
} satisfies Record<string, Record<string, string>>;

export type TranslationKey = keyof typeof translations.en;

export function getT(lang: Lang | string | undefined): typeof translations.en {
  return translations[(lang as Lang) ?? "en"] ?? translations.en;
}
