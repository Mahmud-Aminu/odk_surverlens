import { odkStorage } from "./StorageManager";

/**
 * ServerForm
 * Minimal interface for server-side form metadata
 */
export interface ServerForm {
    id: string;
    title: string;
    version: string;
    hash: string;
    downloadUrl: string;
    manifestUrl?: string;
    metadata?: Record<string, any>;
}

/**
 * FormService
 * Handles remote fetching and synchronization of form definitions (JSON/XML).
 * Integrates with StorageManager for persistent local storage.
 */
export class FormService {
    /**
     * Fetches the list of available forms from a remote server
     * @param serverUrl The base URL of the ODK/JSON form server
     */
    public static async fetchFormList(serverUrl: string): Promise<ServerForm[]> {
        console.log(`Fetching form list from: ${serverUrl}`);

        try {
            const response = await fetch(`${serverUrl}/formList`, {
                headers: {
                    'Accept': 'application/json',
                    'X-OpenRosa-Version': '1.0',
                }
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : (data.forms || []);
        } catch (error) {
            console.error("Failed to fetch form list:", error);
            throw error;
        }
    }

    /**
     * Downloads and saves a form definition to the device
     * @param form The server form metadata
     */
    public static async downloadForm(form: ServerForm): Promise<string> {
        console.log(`Downloading form: ${form.title} (${form.id})`);

        try {
            const response = await fetch(form.downloadUrl);

            if (!response.ok) {
                throw new Error(`Failed to download form content: ${response.statusText}`);
            }

            const content = await response.text();

            // Save to ODK-compliant storage
            // Note: saveForm handles JSON/XML detection and metadata creation
            const localPath = await odkStorage.saveForm({
                id: form.id,
                title: form.title,
                version: form.version,
                hash: form.hash,
                downloadUrl: form.downloadUrl,
                manifestUrl: form.manifestUrl,
                metadata: form.metadata
            }, content);

            console.log(`✓ Form downloaded and saved to: ${localPath}`);
            return localPath;
        } catch (error) {
            console.error(`Error downloading form ${form.id}:`, error);
            throw error;
        }
    }
}
