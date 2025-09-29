import { GoogleGenAI, Type } from "@google/genai";

// Assume process.env.API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function simulateCommandExecution(command: string, args: string): Promise<CommandOutput> {
  const fullCommand = `${command} ${args}`.trim();

  const prompt = `
    Simulate the terminal output for the following command:
    \`${fullCommand}\`

    Provide the output as a JSON object with three keys: "stdout", "stderr", and "exitCode".
    - If the command is successful, "stdout" should contain the typical output, "stderr" should be an empty string, and "exitCode" should be 0.
    - If the command would fail or produce an error, "stdout" should be empty, "stderr" should contain a realistic error message, and "exitCode" should be a non-zero integer (e.g., 1).
    - For simple commands like 'echo', return the echoed text in stdout and exitCode 0.
    - For commands like 'ls' or 'dir', provide a sample file listing and exitCode 0.
    - For commands that don't exist, provide a "command not found" error in stderr and a corresponding exitCode (e.g., 127).
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stdout: { type: Type.STRING },
            stderr: { type: Type.STRING },
            exitCode: { type: Type.INTEGER },
          },
          required: ["stdout", "stderr", "exitCode"],
        },
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    // Basic validation
    if (typeof result.stdout === 'string' && typeof result.stderr === 'string' && typeof result.exitCode === 'number') {
      return result;
    } else {
      throw new Error("Invalid JSON structure from Gemini API");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      stdout: "",
      stderr: `Failed to simulate command. ${(error as Error).message}`,
      exitCode: 1,
    };
  }
}