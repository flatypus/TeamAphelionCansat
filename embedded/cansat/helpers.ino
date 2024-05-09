#include <math.h>
#include <cstring>

#define SEALEVELPRESSURE_HPA (1013.25)

float altitude(float pressure)
{
    return 44308 * (1 - pow((pressure / SEALEVELPRESSURE_HPA), 0.190284));
}

int parseMessage(char *msg)
{
    char *token = strtok(msg, ",");
    int counter = 0;
    while (token != NULL)
    {
        if (counter == 2)
        {
            return atoi(token);
        }
        token = strtok(NULL, ",");
        counter++;
    }
    return -1;
}
