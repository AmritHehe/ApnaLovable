import {z} from "zod"; 

export const createFile = { 
    discription : "create a file at certain directory",
    inputSchema : z.object({ 
        location : z
        .string()
        .describe("Relative path to ur file ")
    }),
    execute: async({location}: {location :string}) => { 
        return `File Contents`
    }

}
export const updateFile = {
    description: 'Update a file at a certain directory',
    inputSchema: z.object({
      location: z.string().describe('Relative path to the file'),
      content: z.string().describe('Content of the file'),
    }),
    execute: async ({ location, content }: { location: string, content: string }) => {
      return `File updated`;
    },
};

export const deleteFile = {
    description: 'Delete a file at a certain directory',
    inputSchema: z.object({
      location: z.string().describe('Relative path to the file'),
    }),
    execute: async ({ location }: { location: string }) => {
      return `File deleted`;
    },
};

export const readFile = {
    description: 'Read a file at a certain directory',
    inputSchema: z.object({
      location: z.string().describe('Relative path to the file'),
    }),
    execute: async ({ location }: { location: string }) => {
      return `File Contents`;
    },
};

