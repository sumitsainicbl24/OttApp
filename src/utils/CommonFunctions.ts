export const cleanMovieName =(name: string) => {
    return name
        .replace(/^┃[^┃]*┃\s*/, '') // Remove ┃...┃ from beginning
        .replace(/\s*\[[^\]]*\]\s*$/, '') // Remove [...] from end
        .replace(/\s+\d{4}-\d{2}-\d{2}$/, '') // Remove date patterns (YYYY-MM-DD) from end
        .replace(/\s+(4K|HD|1080p|720p|480p|UHD|HDTV|BluRay|BRRip|WEBRip|DVDRip|HEVC)$/i, '') // Remove quality indicators
        .trim()
}

export const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
}

export const imageResolutionHandlerForUrl = (url: string, resolution?: number) => {
    // Convert http to https if needed
    let processedUrl = url.replace('http://', 'https://')
    
     processedUrl = processedUrl.replace(/_V1_SX\d+/, `_V1_SX${resolution? resolution : 7680}`)

    
    return processedUrl
}

