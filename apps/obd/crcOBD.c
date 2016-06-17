#include "crcOBD.h"


/****************************************************************************
* Functional Description: CRC control code
* input parameters: fcs: previous CRC16 code
* Src: this time participates in the operation data, single byte
* output parameters: None
* the return value : CRC control code
****************************************************************************/
u16 GetFcs(u16 fcs, u8 src)
{
    u16 xor = 0;
    u16 iresult = 0;
    xor = fcs;
    xor ^= src;
    iresult = (((fcs) >> 8) ^ FCSTAB[xor & 0x00ff]);
    return iresult;
}


/****************************************************************************
*Functional description: CRC check
* input parameters: psrc: to check data ilen: data length
* output parameters: None
* the return value: 0:success -1: failed
****************************************************************************/
s16 CRC_CheckCrc(u8 *psrc, u16 ilen)
{
    u16 crc = 0;
    s16 iresult = 0;;
    crc = FCS_START;
    while(ilen-- != 0)
    {
        crc = GetFcs(crc,*psrc);
        psrc++;
    }
    if (FCS_FINAL != crc)
    {
        iresult = -1;
    }
    else
    {
        iresult = 0;
    }
    return iresult;
}


/****************************************************************************
*Functional description: CRC check code
* input parameters: psrc: to check data buffer pointer
ilen: data length
* output parameters: None
* the return value: check code
****************************************************************************/
u16 CRC_MakeCrc(u8 * psrc, u16 ilen)
{
    u16 crc = 0;
    crc = FCS_START;
    while(ilen-- > 0)
    {
        crc = GetFcs(crc,*psrc++);
    }
    crc ^= FCS_START;
    return crc;
}



int main(void)
{
    CRC_MakeCrc("123456789", 9);
    //CRC_CheckCrc(Source, 1);
    return 0;
}
