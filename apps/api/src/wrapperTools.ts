import type Sandbox from "@e2b/code-interpreter";
import { z } from "zod";

export const createFile = (sandbox: Sandbox) => {
    return {
        description: 'Create a file at a certain directory',
        inputSchema: z.object({
          location: z
            .string()
            .describe('Relative path to the file')
        }),
        execute: async ({ location }: { location: string }) => {
          console.log(`Creating file at ${location}`);
          await sandbox.files.write(location, '');
          return `File created`;
        },
    }
}

export const updateFile = (sandbox: Sandbox) => {
    return {
        description: 'Update a file at a certain directory',
        inputSchema: z.object({
            location: z.string().describe('Relative path to the file'),
            content: z.string().describe('Content of the file'),
        }),
        execute: async ({ location, content }: { location: string, content: string }) => {
            console.log(`Updating file at ${location}`);
            console.log(`Content: ${content}`);
            await sandbox.files.write(location, content);
            return `File updated`;
        },
    }
}

export const deleteFile = (sandbox: Sandbox) => {
    return {
        description: 'Delete a file at a certain directory',
        inputSchema: z.object({
            location: z.string().describe('Relative path to the file'),
        }),
        execute: async ({ location }: { location: string }) => {
            console.log(`Deleting file at ${location}`);
            await sandbox.files.remove(location);
            return `File deleted`;
        },
    }
}

export const readFile = (sandbox: Sandbox) => {
    return {
        description: 'Read a file at a certain directory',
        inputSchema: z.object({
            location: z.string().describe('Relative path to the file'),
        }),
        execute: async ({ location }: { location: string }) => {
            console.log(`Reading file at ${location}`);
            const content = await sandbox.files.read(location);
            return content;
        },
    }
}

export const runCommand = (sandbox: Sandbox) => {
  return {
    description: "Run a shell command inside the sandbox environment",
    inputSchema: z.object({
      command: z.string().describe("The terminal command to execute"),
    }),
    execute: async ({ command }: { command: string }) => {
      console.log(`Executing command: ${command}`);
      const result = await sandbox.commands.run(command);
      return result ?? "No output";
    },
  };
};